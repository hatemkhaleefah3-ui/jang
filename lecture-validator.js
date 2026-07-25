function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function pointerSegment(value) {
  return String(value).replace(/~/g, "~0").replace(/\//g, "~1");
}

function appendPath(path, segment) {
  return `${path}/${pointerSegment(segment)}`;
}

function resolveLocalReference(rootSchema, reference) {
  if (typeof reference !== "string" || !reference.startsWith("#/")) return null;
  let current = rootSchema;
  for (const rawPart of reference.slice(2).split("/")) {
    const part = rawPart.replace(/~1/g, "/").replace(/~0/g, "~");
    if (!current || typeof current !== "object" || !hasOwn(current, part)) return null;
    current = current[part];
  }
  return current;
}

function isType(value, expected) {
  if (expected === "array") return Array.isArray(value);
  if (expected === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (expected === "integer") return Number.isInteger(value);
  if (expected === "number") return typeof value === "number" && Number.isFinite(value);
  return typeof value === expected;
}

function pushError(errors, instancePath, keyword, message, params = {}) {
  errors.push({ instancePath, keyword, message, params });
}

function validateNode(schema, value, instancePath, rootSchema, errors) {
  if (!schema || typeof schema !== "object") return;

  if (schema.$ref) {
    const resolved = resolveLocalReference(rootSchema, schema.$ref);
    if (!resolved) {
      pushError(errors, instancePath, "$ref", `cannot resolve reference ${schema.$ref}`);
      return;
    }
    validateNode(resolved, value, instancePath, rootSchema, errors);
    return;
  }

  if (Array.isArray(schema.allOf)) {
    for (const child of schema.allOf) validateNode(child, value, instancePath, rootSchema, errors);
  }

  if (Array.isArray(schema.oneOf)) {
    const alternatives = schema.oneOf.map((child) => {
      const childErrors = [];
      validateNode(child, value, instancePath, rootSchema, childErrors);
      return childErrors;
    });
    const passing = alternatives.filter((childErrors) => childErrors.length === 0);
    if (passing.length !== 1) {
      const closest = alternatives.reduce((best, candidate) => (
        !best || candidate.length < best.length ? candidate : best
      ), null);
      if (passing.length === 0 && closest?.length) errors.push(...closest);
      pushError(errors, instancePath, "oneOf", "must match exactly one allowed schema");
    }
    return;
  }

  if (hasOwn(schema, "const") && value !== schema.const) {
    pushError(errors, instancePath, "const", `must be equal to constant ${JSON.stringify(schema.const)}`);
    return;
  }

  if (Array.isArray(schema.enum) && !schema.enum.some((candidate) => Object.is(candidate, value))) {
    pushError(errors, instancePath, "enum", `must be equal to one of the allowed values`);
    return;
  }

  if (schema.type && !isType(value, schema.type)) {
    pushError(errors, instancePath, "type", `must be ${schema.type}`);
    return;
  }

  if (typeof value === "string") {
    if (Number.isInteger(schema.minLength) && value.length < schema.minLength) {
      pushError(errors, instancePath, "minLength", `must NOT have fewer than ${schema.minLength} characters`);
    }
    return;
  }

  if (typeof value === "number") {
    if (typeof schema.minimum === "number" && value < schema.minimum) {
      pushError(errors, instancePath, "minimum", `must be >= ${schema.minimum}`);
    }
    return;
  }

  if (Array.isArray(value)) {
    if (Number.isInteger(schema.minItems) && value.length < schema.minItems) {
      pushError(errors, instancePath, "minItems", `must NOT have fewer than ${schema.minItems} items`);
    }
    if (schema.items) {
      value.forEach((item, index) => validateNode(schema.items, item, appendPath(instancePath, index), rootSchema, errors));
    }
    return;
  }

  if (value !== null && typeof value === "object") {
    const properties = schema.properties && typeof schema.properties === "object" ? schema.properties : {};
    if (Array.isArray(schema.required)) {
      for (const key of schema.required) {
        if (!hasOwn(value, key)) {
          pushError(errors, instancePath, "required", `must have required property '${key}'`, { missingProperty: key });
        }
      }
    }

    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!hasOwn(properties, key)) {
          pushError(errors, appendPath(instancePath, key), "additionalProperties", "must NOT have additional properties", { additionalProperty: key });
        }
      }
    }

    for (const [key, childSchema] of Object.entries(properties)) {
      if (hasOwn(value, key)) validateNode(childSchema, value[key], appendPath(instancePath, key), rootSchema, errors);
    }
  }
}

export function createStaticSchemaValidator(rootSchema) {
  function validate(value) {
    const errors = [];
    validateNode(rootSchema, value, "", rootSchema, errors);
    validate.errors = errors.length ? errors : null;
    return errors.length === 0;
  }

  validate.errors = null;
  return validate;
}

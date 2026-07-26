import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const generated = resolve(root, "functions", "_generated");

await mkdir(generated, { recursive: true });

function makeEngineWorkerSafe(source) {
  let engine = source;
  const validatorImport = 'import { createStaticSchemaValidator as __createStaticSchemaValidator } from "../../lecture-validator.js";\n';
  if (!engine.startsWith(validatorImport)) engine = `${validatorImport}${engine}`;

  const stringCallbackPattern = /typeof ([A-Za-z_$][\w$]*) != "function" && \(\1 = new Function\("" \+ \1\)\);/;
  engine = engine.replace(
    stringCallbackPattern,
    (_match, callbackName) => `if (typeof ${callbackName} != "function") throw new TypeError("setImmediate callback must be a function");`,
  );

  const runtimeCompilerPattern = /const ([A-Za-z_$][\w$]*) = new Function\(`\$\{t\.default\.self\}`, `\$\{t\.default\.scope\}`, ([A-Za-z_$][\w$]*)\)\(this, this\.scope\.get\(\)\);/;
  if (!runtimeCompilerPattern.test(engine)) {
    throw new Error("Could not find the bundled runtime function constructor for the Worker engine.");
  }
  engine = engine.replace(
    runtimeCompilerPattern,
    (_match, validatorName) => `const ${validatorName} = (() => { throw new Error("Runtime schema compilation is disabled in the Worker build."); })();`,
  );

  const schemaCompilerPattern = /}, ([A-Za-z_$][\w$]*) = ([A-Za-z_$][\w$]*), ([A-Za-z_$][\w$]*) = new ([A-Za-z_$][\w$]*)\(\{ allErrors: !0, strict: !1 \}\);\s*([A-Za-z_$][\w$]*)\(\3\);\s*const ([A-Za-z_$][\w$]*) = \3\.compile\(\2\), ([A-Za-z_$][\w$]*) = \[/;
  if (!schemaCompilerPattern.test(engine)) {
    throw new Error("Could not find the bundled runtime schema compiler for the Worker engine.");
  }
  engine = engine.replace(
    schemaCompilerPattern,
    (_match, schemaAlias, schemaName, _ajvName, _ajvConstructor, _formatInstaller, validatorName, labelsName) =>
      `}, ${schemaAlias} = ${schemaName};\nconst ${validatorName} = __createStaticSchemaValidator(${schemaName}), ${labelsName} = [`,
  );

  const blockedTokens = [
    ["e", "val", "("].join(""),
    ["new ", "Func", "tion("].join(""),
    ["Func", "tion(\""].join(""),
    ["Func", "tion('"] .join(""),
    [".constructor(\""].join(""),
    [".constructor('"] .join(""),
  ];
  const remaining = blockedTokens.find((token) => engine.includes(token));
  if (remaining) throw new Error(`Worker-incompatible string execution remains in the PPTX engine: ${remaining}`);
  return engine;
}

const engineSource = await readFile(resolve(root, "pptx-engine.js"), "utf8");
await writeFile(resolve(generated, "pptx-engine-worker.js"), makeEngineWorkerSafe(engineSource), "utf8");

const claudeSource = await readFile(resolve(root, "claude-import.js"), "utf8");
const claudeWorker = claudeSource
  .replace('from "./lecture-validator.js"', 'from "../../lecture-validator.js"')
  .replace('from "./pptx-engine.js"', 'from "./pptx-engine-worker.js"');
await writeFile(resolve(generated, "claude-import-worker.js"), claudeWorker, "utf8");

const outputSource = await readFile(resolve(root, "pptx-output.js"), "utf8");
const outputWorker = outputSource.replace('from "./pptx-engine.js"', 'from "./pptx-engine-worker.js"');
await writeFile(resolve(generated, "pptx-output-worker.js"), outputWorker, "utf8");

const schema = JSON.parse(await readFile(resolve(root, "lecture-schema.json"), "utf8"));
await writeFile(resolve(generated, "lecture-schema.js"), `export default ${JSON.stringify(schema)};\n`, "utf8");

console.log("Generated Worker-safe Claude import and PPTX modules for Pages Functions.");

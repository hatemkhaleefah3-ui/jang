import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const assetVersion = "20260725-csp-safe";
const staticFiles = [
  "index.html",
  "styles.css",
  "browser-compat.js",
  "file-picker-bootstrap.js",
  "app-loader.js",
  "app.js",
  "lecture-file.js",
  "lecture-validator.js",
  "pptx-engine.js",
  "pptx-output.js",
  "__vite-browser-external.js",
  "lecture-schema.json",
  "pptx-reader.js",
  "_headers",
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of staticFiles) {
  const source = resolve(root, file);
  const target = resolve(output, file);
  await access(source);
  await cp(source, target);
}

async function replaceRequired(relativePath, search, replacement, description) {
  const target = resolve(output, relativePath);
  const source = await readFile(target, "utf8");
  if (!source.includes(search)) {
    throw new Error(`Could not find ${description} in ${relativePath}.`);
  }
  await writeFile(target, source.replace(search, replacement), "utf8");
}

const indexPath = resolve(output, "index.html");
let indexHtml = await readFile(indexPath, "utf8");
if (!indexHtml.includes("20260725-file-ready-ack")) {
  throw new Error("Could not find the previous asset version in index.html.");
}
indexHtml = indexHtml.replaceAll("20260725-file-ready-ack", assetVersion);
await writeFile(indexPath, indexHtml, "utf8");

await replaceRequired(
  "app-loader.js",
  './app.js?v=20260725-file-ready-ack',
  `./app.js?v=${assetVersion}`,
  "the application import",
);
await replaceRequired(
  "app.js",
  'from "./pptx-output.js"',
  `from "./pptx-output.js?v=${assetVersion}"`,
  "the PPTX output import",
);
await replaceRequired(
  "app.js",
  'from "./pptx-reader.js"',
  `from "./pptx-reader.js?v=${assetVersion}"`,
  "the PPTX reader import",
);
await replaceRequired(
  "app.js",
  'from "./lecture-file.js"',
  `from "./lecture-file.js?v=${assetVersion}"`,
  "the lecture file helper import",
);
await replaceRequired(
  "pptx-output.js",
  'from "./pptx-engine.js"',
  `from "./pptx-engine.js?v=${assetVersion}"`,
  "the PPTX engine import",
);

const enginePath = resolve(output, "pptx-engine.js");
let engine = await readFile(enginePath, "utf8");
const validatorImport = `import { createStaticSchemaValidator as __createStaticSchemaValidator } from "./lecture-validator.js?v=${assetVersion}";\n`;
if (!engine.startsWith(validatorImport)) engine = `${validatorImport}${engine}`;

const constructorName = ["Func", "tion"].join("");
const stringCallbackSource = `typeof E != "function" && (E = new ${constructorName}("" + E));`;
const safeCallbackSource = 'if (typeof E != "function") throw new TypeError("setImmediate callback must be a function");';
if (!engine.includes(stringCallbackSource)) {
  throw new Error("Could not find the bundled setImmediate string-callback branch.");
}
engine = engine.replace(stringCallbackSource, safeCallbackSource);

const runtimeCompilerSource = [
  "const M = new ",
  constructorName,
  '(`${t.default.self}`, `${t.default.scope}`, k)(this, this.scope.get());',
].join("");
const disabledRuntimeCompiler = 'const M = (() => { throw new Error("Runtime schema compilation is disabled in the CSP-safe browser build."); })();';
if (!engine.includes(runtimeCompilerSource)) {
  throw new Error("Could not find the bundled runtime function constructor.");
}
engine = engine.replace(runtimeCompilerSource, disabledRuntimeCompiler);

const schemaCompilerPattern = /}, Ac = Ui, Gi = new Wl\(\{ allErrors: !0, strict: !1 \}\);\s*jl\(Gi\);\s*const fa = Gi\.compile\(Ui\), ac = \[/;
if (!schemaCompilerPattern.test(engine)) {
  throw new Error("Could not find the bundled runtime schema compiler.");
}
engine = engine.replace(
  schemaCompilerPattern,
  "}, Ac = Ui;\nconst fa = __createStaticSchemaValidator(Ui), ac = [",
);

const blockedTokens = [
  ["e", "val", "("].join(""),
  ["new ", "Func", "tion("].join(""),
  ["Func", "tion(\""].join(""),
  ["Func", "tion('"] .join(""),
  [".constructor(\""].join(""),
  [".constructor('"] .join(""),
];
const remainingToken = blockedTokens.find((token) => engine.includes(token));
if (remainingToken) {
  throw new Error(`CSP-incompatible string execution remains in the production PPTX engine: ${remainingToken}`);
}

await writeFile(enginePath, engine, "utf8");
console.log(`Prepared ${staticFiles.length} static files with a CSP-safe static lecture validator and versioned module graph in dist.`);

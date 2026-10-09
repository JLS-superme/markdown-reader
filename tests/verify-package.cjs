const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const asar = require("@electron/asar");
const root = path.resolve(__dirname, "..");
const archive = path.join(root, "dist", "win-unpacked", "resources", "app.asar");
for (const name of ["app.js", "main.js", "markdown-syntax.js", "index.html", "styles.css", "preload.js", "vendor/mermaid-elk.min.js", "vendor/mermaid-elk.min.js.LEGAL.txt"]) {
  assert.deepEqual(asar.extractFile(archive, name), fs.readFileSync(path.join(root, name)), name + " differs from tested source");
}
const version = require('../package.json').version;
assert.equal(JSON.parse(asar.extractFile(archive, "package.json")).version, version);
console.log(`Packaged files match tested version ${version}.`);

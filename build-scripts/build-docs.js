// build-scripts/build-docs.js
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Hand-written demo pages live inside the generated docs tree; never wipe them.
const PROTECTED_DOCS_DIR = path.resolve(__dirname, "../docs/demos");

function removeHtmlFilesRecursively(dirPath, protectedDir = PROTECTED_DOCS_DIR) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (path.resolve(fullPath) === path.resolve(protectedDir)) {
        continue;
      }

      removeHtmlFilesRecursively(fullPath, protectedDir);
      continue;
    }

    if (entry.isFile() && fullPath.endsWith(".html")) {
      fs.rmSync(fullPath, { force: true });
    }
  }
}

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

if (require.main === module) {
  console.log("Build Docs");

  removeHtmlFilesRecursively("./docs");

  run("./node_modules/jsdoc/jsdoc.js -c ./.jsdoc.conf.json");
  run("./node_modules/jsdoc/jsdoc.js -c extensions/.jsdoc.conf.json");
  run("./node_modules/jsdoc/jsdoc.js -c debugger/.jsdoc.conf.json");
  run("node build-scripts/clean-folder.js");
  run("node build-scripts/build-examples.js");
  run("node build-scripts/build-donation.js");
}

module.exports = { PROTECTED_DOCS_DIR, removeHtmlFilesRecursively };

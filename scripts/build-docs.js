// scripts/build-docs.js
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Build Docs");

function removeHtmlFilesRecursively(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      removeHtmlFilesRecursively(fullPath);
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

removeHtmlFilesRecursively("./docs");

run("./node_modules/jsdoc/jsdoc.js -c ./.jsdoc.conf.json");
run("./node_modules/jsdoc/jsdoc.js -c ./.jsdoc.extensions.conf.json");
run("./node_modules/jsdoc/jsdoc.js -c ./.jsdoc.debugger.conf.json");
run("node scripts/clean-folder.js");
run("node scripts/build-examples.js");

// scripts/build-docs.js
const { execSync, exec } = require("child_process");

console.log("Build Docs");

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

run("./node_modules/jsdoc/jsdoc.js -c ./.jsdoc.conf.json");
run("./node_modules/jsdoc/jsdoc.js -c ./.jsdoc.extensions.conf.json");
run("./node_modules/jsdoc/jsdoc.js -c ./.jsdoc.debugger.conf.json");
run("node scripts/clean-folder.js");
run("node scripts/build-examples.js");

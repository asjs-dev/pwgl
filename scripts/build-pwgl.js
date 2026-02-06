// scripts/build-pwgl.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("Build PWGL");

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

const builderPath = path.resolve("../asjs/builder/jsonBuilder.php");

if (fs.existsSync(builderPath)) {
  try {
    run(
      `php ${builderPath} builder_config/pwgl.build.config.json builder_config/webgl.variables.json`,
    );
    run(`php ${builderPath} builder_config/pwgl.extensions.build.config.json`);
    run(`php ${builderPath} builder_config/pwgl.debugger.build.config.json`);
  } catch {
    console.error("PWGL build failed");
    process.exit(1);
  }
} else {
  console.warn("ASJS Builder not found! Use Vite build only.");
}

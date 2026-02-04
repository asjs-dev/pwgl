// scripts/build-pwgl.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("Build PWGL");

const builderPath = path.resolve("../asjs/builder/jsonBuilder.php");

if (fs.existsSync(builderPath)) {
  try {
    execSync(
      `php ${builderPath} builder_config/pwgl.build.config.json builder_config/webgl.variables.json`,
      { stdio: "inherit" }
    );
    execSync(
      `php ${builderPath} builder_config/pwgl.extensions.build.config.json`,
      { stdio: "inherit" }
    );
  } catch {
    console.error("PWGL build failed");
    process.exit(1);
  }
} else {
  console.warn("ASJS Builder not found! Use Vite build only.");
}

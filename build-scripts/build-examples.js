// build-scripts/build-examples.js
const fs = require("fs");
const path = require("path");
const { COLORS } = require("./colors");

console.log("Building example HTML files...");

try {
  const examplesJsonPath = path.resolve("docs/assets/examples.json");
  const examplesJson = JSON.parse(fs.readFileSync(examplesJsonPath, "utf-8"));

  const examplesTemplPath = path.resolve("docs/assets/examples.tmpl");
  const template = fs.readFileSync(examplesTemplPath, "utf-8");

  const examplesDir = path.resolve("docs/examples");
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir, { recursive: true });
  }

  examplesJson.forEach((example) => {
    let html = template;

    html = html.replace(/\<\?js=\s*title\s*\?\>/g, example.title);
    html = html.replace(/\<\?js=\s*id\s*\?\>/g, example.id);

    const filePath = path.join(examplesDir, example.file);
    fs.writeFileSync(filePath, html, "utf-8");
    console.log(`${COLORS.blueOnBlack}- Generated: ${example.file}${COLORS.reset}`);
  });

  console.log(`${COLORS.greenOnBlack}✓ Example HTML files built successfully!${COLORS.reset}`);
} catch (err) {
  console.error(`✗ Build examples failed:`, err.message);
  process.exit(1);
}

const fs = require("fs");
const path = require("path");

// Reuse the generated documentation shell, including its navigation and analytics.
const docsDir = path.resolve(__dirname, "../docs");
const home = fs.readFileSync(path.join(docsDir, "index.html"), "utf8");
const content = fs.readFileSync(path.join(docsDir, "assets/donation.tmpl"), "utf8");
const main = /(<div id="main">)[\s\S]*?(<\/div>\s*<nav>)/;
if (!main.test(home)) throw new Error("Documentation main/navigation layout was not found.");

const html = home
  .replace("<title>PWGL: Home</title>", "<title>PWGL: Support PWGL</title>")
  .replace(main, (_, start, end) => `${start}\n${content}\n${end}`)
  .replace(/\b(href|src)="(?![a-z]+:|\/|#)([^"]+)"/gi, '$1="../$2"')
  .replace(/[ \t]+$/gm, "");

fs.mkdirSync(path.join(docsDir, "donation"), { recursive: true });
fs.writeFileSync(path.join(docsDir, "donation/index.html"), html);
console.log("Generated donation/index.html");

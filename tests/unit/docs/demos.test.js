import fs from "fs";
import os from "os";
import path from "path";
import { createRequire } from "module";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const {
  PROTECTED_DOCS_DIR,
  removeHtmlFilesRecursively,
} = require("../../../build-scripts/build-docs.js");

const docsDir = path.resolve(__dirname, "../../../docs");
const demos = JSON.parse(fs.readFileSync(path.join(docsDir, "assets/demos.json"), "utf-8"));

describe("demos.json", () => {
  it("is the only demo list", () => {
    expect(fs.existsSync(path.join(docsDir, "assets/examples.json"))).toBe(false);
  });

  it("has unique ids", () => {
    const ids = demos.map((demo) => demo.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every entry the common fields and a known type", () => {
    for (const demo of demos) {
      for (const field of ["id", "title", "description"]) {
        expect(typeof demo[field], `${demo.id}.${field}`).toBe("string");
        expect(demo[field].length, `${demo.id}.${field}`).toBeGreaterThan(0);
      }
      expect(["local", "codepen"]).toContain(demo.type);
    }
  });

  it("points every local entry to a demo folder with an index.html", () => {
    const localDemos = demos.filter((demo) => demo.type === "local");

    expect(localDemos.length).toBeGreaterThan(0);
    for (const demo of localDemos) {
      expect(fs.existsSync(path.join(docsDir, "demos", demo.path, "index.html")), demo.id).toBe(
        true,
      );
    }
  });

  it("gives every codepen entry a pen id and a generated example file name", () => {
    const codepenDemos = demos.filter((demo) => demo.type === "codepen");

    expect(codepenDemos.length).toBeGreaterThan(0);
    for (const demo of codepenDemos) {
      expect(demo.codepenId, demo.id).toMatch(/^\w+$/);
      expect(demo.file, demo.id).toMatch(/^[\w-]+\.html$/);
    }
  });

  it("keeps the generated example pages in step with the codepen entries", () => {
    const files = demos
      .filter((demo) => demo.type === "codepen")
      .map((demo) => demo.file)
      .sort();
    const generated = fs
      .readdirSync(path.join(docsDir, "examples"))
      .filter((file) => file.endsWith(".html"))
      .sort();

    expect(files).toEqual(generated);
  });
});

describe("demo links", () => {
  const landingUrl = "https://asjs-dev.github.io/pwgl/demos/";

  it("points the README and the docs home to the landing page", () => {
    const readme = fs.readFileSync(path.resolve(docsDir, "../README.md"), "utf-8");
    const docsHome = fs.readFileSync(path.join(docsDir, "index.html"), "utf-8");

    expect(readme).toContain(`(${landingUrl})`);
    expect(docsHome).toContain(`href="${landingUrl}"`);
  });
});

describe("local demo modules", () => {
  const MAX_MODULE_LINES = 160;
  const BUNDLE_IMPORT = "../../assets/pwgl.es.js";
  const bundleExports = new Set(
    [
      ...fs
        .readFileSync(path.join(docsDir, "assets/pwgl.es.js"), "utf-8")
        .matchAll(/\bas (\w+)[,}]/g),
    ].map((match) => match[1]),
  );
  const modules = demos
    .filter((demo) => demo.type === "local")
    .flatMap((demo) => {
      const demoDir = path.join(docsDir, "demos", demo.path);
      return fs
        .readdirSync(demoDir)
        .filter((file) => file.endsWith(".js"))
        .map((file) => ({
          name: `${demo.path}/${file}`,
          dir: demoDir,
          source: fs.readFileSync(path.join(demoDir, file), "utf-8"),
        }));
    });

  it("finds the modules", () => {
    expect(modules.length).toBeGreaterThan(0);
  });

  it("imports only sibling modules and existing exports of the ES bundle", () => {
    for (const { name, dir, source } of modules) {
      for (const [, names, specifier] of source.matchAll(
        /import\s*\{([^}]*)\}\s*from\s*"([^"]+)"/g,
      )) {
        if (specifier === BUNDLE_IMPORT) {
          for (const imported of names.split(",").map((part) => part.trim()).filter(Boolean)) {
            expect(bundleExports.has(imported), `${name} imports ${imported}`).toBe(true);
          }
        } else {
          expect(specifier, name).toMatch(/^\.\/[\w-]+\.js$/);
          expect(fs.existsSync(path.join(dir, specifier)), `${name} → ${specifier}`).toBe(true);
        }
      }
    }
  });

  it("does not use the UMD global or grow past the module size limit", () => {
    for (const { name, source } of modules) {
      expect(source, name).not.toMatch(/window\.PWGL|\bPWGL\./);
      expect(source.split("\n").length, name).toBeLessThanOrEqual(MAX_MODULE_LINES);
    }
  });
});

describe("build-docs HTML wipe", () => {
  let tempDir;

  afterEach(() => {
    if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  });

  const writeFile = (relativePath) => {
    const filePath = path.join(tempDir, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, "<html></html>");
    return filePath;
  };

  it("protects docs/demos by default", () => {
    expect(PROTECTED_DOCS_DIR).toBe(path.join(docsDir, "demos"));
  });

  it("removes generated HTML but keeps the protected folder", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pwgl-docs-"));
    const generated = writeFile("Image.html");
    const nested = writeFile("examples/boatDemo.html");
    const demoPage = writeFile("demos/index.html");
    const demoGame = writeFile("demos/neon-corridor/index.html");

    removeHtmlFilesRecursively(tempDir, path.join(tempDir, "demos"));

    expect(fs.existsSync(generated)).toBe(false);
    expect(fs.existsSync(nested)).toBe(false);
    expect(fs.existsSync(demoPage)).toBe(true);
    expect(fs.existsSync(demoGame)).toBe(true);
  });
});

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const packageJsonPath = path.resolve(projectRoot, "extensions", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

const replaceMap = {};
replaceMap["{{appVersion}}"] = packageJson.version;
replaceMap["{{date}}"] = Date.now().toString();

const entries = [
  {
    entry: "extensions/src/index.js",
    name: "PWGLExtensions",
    fileBase: "pwgl.extensions",
  },
  {
    entry: "extensions/src/utils/entry.ts",
    name: "PWGLExtensionsUtils",
    fileBase: "pwgl.extensions.utils",
  },
  {
    entry: "extensions/src/audio/entry.js",
    name: "PWGLExtensionsAudio",
    fileBase: "pwgl.extensions.audio",
  },
  {
    entry: "extensions/src/controls/entry.js",
    name: "PWGLExtensionsControls",
    fileBase: "pwgl.extensions.controls",
  },
  {
    entry: "extensions/src/display/entry.js",
    name: "PWGLExtensionsDisplay",
    fileBase: "pwgl.extensions.display",
  },
];

const copyToDocs = (fileBase) => {
  for (const format of ["umd", "es"]) {
    const fileName = `${fileBase}.${format}.js`;
    const from = path.resolve(projectRoot, "dist", fileName);
    const to = path.resolve(projectRoot, "docs", "assets", fileName);

    fs.copyFileSync(from, to);
  }
};

const createConfig = async ({ entry, name, fileBase }) => {
  const { default: replace } = await import("@rollup/plugin-replace");

  return {
    root: projectRoot,
    configFile: false,
    build: {
      lib: {
        entry,
        name,
        fileName: (format) => `${fileBase}.${format}.js`,
        formats: ["es", "umd"],
      },
      minify: "terser",
      terserOptions: {
        mangle: {
          properties: {
            regex: /^_/,
          },
        },
      },
      emptyOutDir: false,
    },
    plugins: [
      replace({
        preventAssignment: true,
        values: replaceMap,
      }),
    ],
  };
};

const main = async () => {
  const { build } = await import("vite");

  for (const entry of entries) {
    await build(await createConfig(entry));
    copyToDocs(entry.fileBase);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

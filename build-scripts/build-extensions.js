const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const packageJsonPath = path.resolve(projectRoot, "extensions", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

const replaceMap = {};
replaceMap["{{appVersion}}"] = packageJson.version;
replaceMap["{{date}}"] = Date.now().toString();

const entries = [
  {
    esEntry: "extensions/src/exports.ts",
    umdEntry: "extensions/src/index.ts",
    name: "PWGLExtensions",
    fileBase: "pwgl.extensions",
  },
  {
    esEntry: "extensions/src/utils/index.ts",
    umdEntry: "extensions/src/utils/entry.ts",
    name: "PWGLExtensionsUtils",
    fileBase: "pwgl.extensions.utils",
  },
  {
    esEntry: "extensions/src/audio/index.ts",
    umdEntry: "extensions/src/audio/entry.ts",
    name: "PWGLExtensionsAudio",
    fileBase: "pwgl.extensions.audio",
  },
  {
    esEntry: "extensions/src/controls/index.ts",
    umdEntry: "extensions/src/controls/entry.ts",
    name: "PWGLExtensionsControls",
    fileBase: "pwgl.extensions.controls",
  },
  {
    esEntry: "extensions/src/display/index.ts",
    umdEntry: "extensions/src/display/entry.ts",
    name: "PWGLExtensionsDisplay",
    fileBase: "pwgl.extensions.display",
  },
  {
    esEntry: "extensions/src/textureAtlas/creator.ts",
    umdEntry: "extensions/src/textureAtlas/creator.ts",
    name: "PWGLExtensionsTextureAtlasCreator",
    fileBase: "pwgl.extensions.texture-atlas-creator",
  },
  {
    esEntry: "extensions/src/textureAtlas/parser.ts",
    umdEntry: "extensions/src/textureAtlas/parser.ts",
    name: "PWGLExtensionsTextureAtlasParser",
    fileBase: "pwgl.extensions.texture-atlas-parser",
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

const createConfig = async ({ entry, name, fileBase, format }) => {
  const { default: replace } = await import("@rollup/plugin-replace");

  return {
    root: projectRoot,
    configFile: false,
    build: {
      lib: {
        entry,
        name,
        fileName: () => `${fileBase}.${format}.js`,
        formats: [format],
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
    await build(
      await createConfig({
        entry: entry.esEntry,
        name: entry.name,
        fileBase: entry.fileBase,
        format: "es",
      }),
    );
    await build(
      await createConfig({
        entry: entry.umdEntry,
        name: entry.name,
        fileBase: entry.fileBase,
        format: "umd",
      }),
    );
    copyToDocs(entry.fileBase);
  }

  execFileSync(
    process.execPath,
    [path.resolve(projectRoot, "node_modules", "typescript", "bin", "tsc"), "-p", "tsconfig.extensions.build.json"],
    { cwd: projectRoot, stdio: "inherit" },
  );

  const declarationEntries = {
    "pwgl.extensions.es.d.ts": "types/extensions/src/exports.d.ts",
    "pwgl.extensions.audio.es.d.ts": "types/extensions/src/audio/index.d.ts",
    "pwgl.extensions.controls.es.d.ts": "types/extensions/src/controls/index.d.ts",
    "pwgl.extensions.display.es.d.ts": "types/extensions/src/display/index.d.ts",
    "pwgl.extensions.texture-atlas-creator.es.d.ts":
      "types/extensions/src/textureAtlas/creator.d.ts",
    "pwgl.extensions.texture-atlas-parser.es.d.ts":
      "types/extensions/src/textureAtlas/parser.d.ts",
    "pwgl.extensions.utils.es.d.ts": "types/extensions/src/utils/index.d.ts",
  };

  const [{ rollup }, { dts }] = await Promise.all([
    import("rollup"),
    import("rollup-plugin-dts"),
  ]);

  for (const [fileName, input] of Object.entries(declarationEntries)) {
    const declarationBundle = await rollup({
      input: path.resolve(projectRoot, "dist", input),
      plugins: [dts()],
    });

    await declarationBundle.write({
      file: path.resolve(projectRoot, "dist", fileName),
      format: "es",
    });
    await declarationBundle.close();
  }

  fs.rmSync(path.resolve(projectRoot, "dist", "types"), { recursive: true, force: true });
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

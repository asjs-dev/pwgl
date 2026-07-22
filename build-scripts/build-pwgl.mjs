import replace from "@rollup/plugin-replace";
import fs from "fs";
import path from "path";
import { build } from "vite";
import { WEBGL_VARIABLES } from "./webgl-variables.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const packageJsonPath = path.resolve(projectRoot, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

const replaceMap = { ...WEBGL_VARIABLES };
replaceMap["{{appVersion}}"] = packageJson.version;
replaceMap["{{date}}"] = Date.now().toString();

const entries = [
  {
    entry: "src/exports.js",
    name: "PWGL",
    fileName: "pwgl.es.js",
    format: "es",
  },
  {
    entry: "src/index.js",
    name: "PWGL",
    fileName: "pwgl.umd.js",
    format: "umd",
  },
];

const createConfig = ({ entry, name, fileName, format }) => ({
  root: projectRoot,
  configFile: false,
  build: {
    lib: {
      entry,
      name,
      fileName: () => fileName,
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
});

const copyToDocs = () => {
  for (const fileName of ["pwgl.umd.js", "pwgl.es.js"]) {
    const from = path.resolve(projectRoot, "dist", fileName);
    const to = path.resolve(projectRoot, "docs", "assets", fileName);

    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
};

for (const entry of entries) {
  await build(createConfig(entry));
}

copyToDocs();

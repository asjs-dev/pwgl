import replace from "@rollup/plugin-replace";
import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import { copyFiles } from "./build-scripts/copy-files";
import { WEBGL_VARIABLES } from "./build-scripts/webgl-variables";

const packageJsonPath = path.resolve(__dirname, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

const replaceMap = { ...WEBGL_VARIABLES };
replaceMap["{{appVersion}}"] = packageJson.version;
replaceMap["{{date}}"] = Date.now().toString();

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      name: "PWGL",
      fileName: (format) => `pwgl.${format}.js`,
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
    copyFiles({
      "dist/pwgl.umd.js": "docs/assets/pwgl.umd.js",
      "dist/pwgl.es.js": "docs/assets/pwgl.es.js",
    }),
  ],
});

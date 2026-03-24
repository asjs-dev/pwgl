import replace from "@rollup/plugin-replace";
import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import { copyFiles } from "../scripts/copy-files";

const packageJsonPath = path.resolve(__dirname, "./package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

const replaceMap = {};
replaceMap["{{appVersion}}"] = packageJson.version;
replaceMap["{{date}}"] = Date.now().toString();

export default defineConfig({
  build: {
    lib: {
      entry: "debugger/index.js",
      name: "PWGL Debugger",
      fileName: (format) => `pwgl.debugger.${format}.js`,
      formats: ["es", "umd"],
    },
    minify: "terser",
    emptyOutDir: false,
  },
  plugins: [
    replace({
      preventAssignment: true,
      values: replaceMap,
    }),
    copyFiles({
      "dist/pwgl.debugger.umd.js": ["docs/assets/pwgl.debugger.umd.js", "docs/assets/pwgl.debugger.min.js"],
      "dist/pwgl.debugger.es.js": "docs/assets/pwgl.debugger.es.js",
    }),
  ],
});

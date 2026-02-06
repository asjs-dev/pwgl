import { defineConfig } from "vite";
import replace from "@rollup/plugin-replace";
import path from "path";
import fs from "fs";

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
      fileName: (format) => `pwgl.debugger.${format}.min.js`,
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
  ],
});

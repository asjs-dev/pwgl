import replace from "@rollup/plugin-replace";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import { copyFiles } from "../build-scripts/copy-files";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(__dirname, "./package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

const replaceMap: Record<string, string> = {};
replaceMap["{{appVersion}}"] = packageJson.version;
replaceMap["{{date}}"] = Date.now().toString();

export default defineConfig({
  build: {
    lib: {
      entry: "debugger/src/index.ts",
      name: "PWGL Debugger",
      fileName: () => "pwgl.debugger.umd.js",
      formats: ["umd"],
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
      "dist/pwgl.debugger.umd.js": "docs/assets/pwgl.debugger.umd.js",
    }),
  ],
});

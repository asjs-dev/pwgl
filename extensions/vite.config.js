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
      entry: "extensions/index.js",
      name: "PWGL Extensions",
      fileName: (format) => `pwgl.extensions.${format}.js`,
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
      "dist/pwgl.extensions.umd.js": ["docs/assets/pwgl.extensions.umd.js", "docs/assets/pwgl.extensions.min.js"],
      "dist/pwgl.extensions.es.js": "docs/assets/pwgl.extensions.es.js",
    }),
  ],
});

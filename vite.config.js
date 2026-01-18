import { defineConfig } from "vite";
import replace from "@rollup/plugin-replace";
import path from "path";
import fs from "fs";

const packageJsonPath = path.resolve(__dirname, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

const replaceJsonPath = path.resolve(
  __dirname,
  "builder_config/webgl.variables.json"
);
const replaceMap = JSON.parse(fs.readFileSync(replaceJsonPath, "utf-8"));
replaceMap["{{appVersion}}"] = packageJson.version;
replaceMap["{{date}}"] = Date.now().toString();

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      name: "PWGL",
      fileName: (format) => `pwgl.${format}.min.js`,
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

import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  base: "./",
  build: {
    outDir: fileURLToPath(new URL("../../../.tmp/pwgl-e2e", import.meta.url)),
    emptyOutDir: true,
  },
});

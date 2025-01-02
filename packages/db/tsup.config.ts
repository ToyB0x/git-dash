import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  target: "es2022",
  entry: ["src/index.ts"],
  format: ["esm"],
  minify: true,
  sourcemap: true,
});

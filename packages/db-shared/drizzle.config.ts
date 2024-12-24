import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/index.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "./sqlite/shared.db",
  },
});

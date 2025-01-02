import { defineConfig } from "drizzle-kit";

// biome-ignore lint/complexity/useLiteralKeys: <explanation>
const DB_FILE_NAME = process.env["DB_FILE_NAME"];
if (!DB_FILE_NAME) {
  throw new Error("DB_FILE_NAME is required");
}

export default defineConfig({
  schema: "./src/index.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: DB_FILE_NAME,
  },
});

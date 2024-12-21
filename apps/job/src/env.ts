import { literal, object, parse, string, union } from "valibot";

const envSchema = object({
  GDASH_PROJECT_ID: union([
    literal("gdash-test"),
    literal("gdash-local"),
    literal("gdash-dev"),
    literal("gdash-stg"),
    literal("gdash-prd"),
  ]),
  GDASH_GITHUB_INTERNAL_APP_ID: string(),
  GDASH_GITHUB_INTERNAL_APP_PRIVATE_KEY_STRING: string(),
  GDASH_WORKSPACE_ID: string(),
  GDASH_WORKSPACE_API_KEY: string(),
  GDASH_GITHUB_ORGANIZATION_NAME: string(),
  // GDASH_GITHUB_PERSONAL_ACCESS_TOKEN: string(),
});

export const env = parse(envSchema, process.env);

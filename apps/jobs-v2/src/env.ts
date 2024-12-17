import { literal, object, parse, string, union } from "valibot";

const envSchema = object({
  GDASH_PROJECT_ID: union([
    literal("gdash-local"),
    literal("gdash-dev"),
    literal("gdash-stg"),
    literal("gdash-prd"),
  ]),
  GDASH_GITHUB_PERSONAL_ACCESS_TOKEN: string(),
});

export const env = parse(envSchema, process.env);

import * as v from "valibot";

const envSchema = v.object({
  GDASH_ENV: v.union([
    v.literal("test"),
    v.literal("local"),
    v.literal("dev"),
    v.literal("stg"),
    v.literal("prd"),
  ]),
  GDASH_GITHUB_INTERNAL_APP_ID: v.pipe(v.string(), v.minLength(5)),
  GDASH_GITHUB_INTERNAL_APP_PRIVATE_KEY_STRING: v.pipe(
    v.string(),
    v.minLength(50),
  ),
  GDASH_WORKSPACE_ID: v.pipe(v.string(), v.minLength(3)),
  GDASH_WORKSPACE_API_KEY: v.pipe(v.string(), v.minLength(5)),
  GDASH_GITHUB_ORGANIZATION_NAME: v.pipe(v.string(), v.minLength(3)),
  // GDASH_GITHUB_PERSONAL_ACCESS_TOKEN: string(),
});

export const env = v.parse(envSchema, process.env);

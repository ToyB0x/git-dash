import { object, parse, string } from "valibot";

const envSchema = object({
  GDASH_GITHUB_PERSONAL_ACCESS_TOKEN: string(),
});

export const env = parse(envSchema, process.env);

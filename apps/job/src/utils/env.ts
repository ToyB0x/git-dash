import { object, parse, string } from "valibot";

const envSchema = object({
  APPS_JOBS_GITHUB_PERSONAL_ACCESS_TOKEN: string(), // public browser key
});

export const env = parse(envSchema, process.env);

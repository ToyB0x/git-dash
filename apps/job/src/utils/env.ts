import { z } from "zod";

const envSchema = z.object({
  // REQUIRED
  NODE_ENV: z.enum(["development", "production", "test"]),
  APPS_DB_NAME: z.string(),
  APPS_DB_PORT: z.coerce.number(),
  // RLS ENABLED
  APPS_JOBS_DB_USER_MIGRATION: z.string(),
  APPS_JOBS_DB_PASS_MIGRATION: z.string(),
  // RLS ENABLED
  APPS_DB_USER_RLS_ENABLED: z.string(),
  APPS_DB_PASS_RLS_ENABLED: z.string(),
  // RLS DISABLED
  APPS_DB_USER_RLS_DISABLED: z.string(),
  APPS_DB_PASS_RLS_DISABLED: z.string(),
  // GITHUB TOKEN
  // TODO: EnvからPERSONAL_ACCESS_TOKENを利用している箇所をDBから読み込むように修正(KMSで暗号化する)
  // https://github.com/users/ToyB0x/projects/1/views/1?pane=issue&itemId=32241358
  APPS_JOBS_GITHUB_PERSONAL_ACCESS_TOKEN: z.string(),
});

export const getEnv = () => envSchema.parse(process.env);
export const checkEnvOnInitServer = () => getEnv();

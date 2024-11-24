import { z } from "zod";

const envSchema = z.object({
  // REQUIRED
  // GITHUB TOKEN
  // TODO: EnvからPERSONAL_ACCESS_TOKENを利用している箇所をDBから読み込むように修正(KMSで暗号化する)
  // https://github.com/users/ToyB0x/projects/1/views/1?pane=issue&itemId=32241358
  APPS_JOBS_GITHUB_PERSONAL_ACCESS_TOKEN: z.string(),
});

export const getEnv = () => envSchema.parse(process.env);

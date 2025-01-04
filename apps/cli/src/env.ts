import * as v from "valibot";

const envSchemaOrganizationAppMode = v.object({
  GDASH_MODE: v.literal("ORGANIZATION_APP"),
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
  GDASH_COLLECT_DAYS_LIGHT_TYPE_ITEMS: v.pipe(
    v.string(),
    v.transform((input) => Number(input)),
    v.number(),
    v.minValue(1),
    v.maxValue(180),
  ),
  GDASH_COLLECT_DAYS_HEAVY_TYPE_ITEMS: v.pipe(
    v.string(),
    v.transform((input) => Number(input)),
    v.number(),
    v.minValue(1),
    v.maxValue(180),
  ),
  GDASH_DISCARD_DAYS: v.pipe(
    v.string(),
    v.transform((input) => Number(input)),
    v.number(),
    v.number(),
    v.minValue(1),
    v.maxValue(180),
  ),
});

const envSchemaSingleRepositoryMode = v.object({
  GDASH_MODE: v.literal("SINGLE_REPOSITORY"),
  GITHUB_TOKEN: v.pipe(v.string(), v.minLength(5)),
  GDASH_ENV: v.union([
    v.literal("test"),
    v.literal("local"),
    v.literal("dev"),
    v.literal("stg"),
    v.literal("prd"),
  ]),
  GDASH_WORKSPACE_ID: v.pipe(v.string(), v.minLength(3)),
  GDASH_WORKSPACE_API_KEY: v.pipe(v.string(), v.minLength(5)),
  GDASH_GITHUB_ORGANIZATION_NAME: v.pipe(v.string(), v.minLength(3)),
  GDASH_COLLECT_DAYS_LIGHT_TYPE_ITEMS: v.pipe(
    v.string(),
    v.transform((input) => Number(input)),
    v.number(),
    v.minValue(1),
    v.maxValue(180),
  ),
  GDASH_COLLECT_DAYS_HEAVY_TYPE_ITEMS: v.pipe(
    v.string(),
    v.transform((input) => Number(input)),
    v.number(),
    v.minValue(1),
    v.maxValue(180),
  ),
  GDASH_DISCARD_DAYS: v.pipe(
    v.string(),
    v.transform((input) => Number(input)),
    v.number(),
    v.number(),
    v.minValue(1),
    v.maxValue(180),
  ),
});

const envSchemaPersonalMode = v.object({
  GDASH_MODE: v.literal("PERSONAL"),
  GDASH_ENV: v.union([
    v.literal("test"),
    v.literal("local"),
    v.literal("dev"),
    v.literal("stg"),
    v.literal("prd"),
  ]),
  GDASH_WORKSPACE_ID: v.pipe(v.string(), v.minLength(3)),
  GDASH_WORKSPACE_API_KEY: v.pipe(v.string(), v.minLength(5)),
  GDASH_GITHUB_ORGANIZATION_NAME: v.pipe(v.string(), v.minLength(3)),
  GDASH_COLLECT_DAYS_LIGHT_TYPE_ITEMS: v.optional(
    v.pipe(
      v.string(),
      v.transform((input) => Number(input)),
      v.number(),
      v.minValue(1),
      v.maxValue(180),
    ),
    "30",
  ),
  GDASH_COLLECT_DAYS_HEAVY_TYPE_ITEMS: v.optional(
    v.pipe(
      v.string(),
      v.transform((input) => Number(input)),
      v.number(),
      v.minValue(1),
      v.maxValue(180),
    ),
    "30",
  ),
  GDASH_DISCARD_DAYS: v.optional(
    v.pipe(
      v.string(),
      v.transform((input) => Number(input)),
      v.number(),
      v.number(),
      v.minValue(1),
      v.maxValue(180),
    ),
    "180",
  ),
});

const envSchemaPersonalSampleMode = v.object({
  GDASH_MODE: v.literal("PERSONAL_SAMPLE"),
  GDASH_ENV: v.union([
    v.literal("test"),
    v.literal("local"),
    v.literal("dev"),
    v.literal("stg"),
    v.literal("prd"),
  ]),
  GDASH_GITHUB_ORGANIZATION_NAME: v.pipe(v.string(), v.minLength(3)),
  GDASH_COLLECT_DAYS_LIGHT_TYPE_ITEMS: v.optional(
    v.pipe(
      v.string(),
      v.transform((input) => Number(input)),
      v.number(),
      v.minValue(1),
      v.maxValue(180),
    ),
    "30",
  ),
  GDASH_COLLECT_DAYS_HEAVY_TYPE_ITEMS: v.optional(
    v.pipe(
      v.string(),
      v.transform((input) => Number(input)),
      v.number(),
      v.minValue(1),
      v.maxValue(180),
    ),
    "30",
  ),
  GDASH_DISCARD_DAYS: v.optional(
    v.pipe(
      v.string(),
      v.transform((input) => Number(input)),
      v.number(),
      v.number(),
      v.minValue(1),
      v.maxValue(180),
    ),
    "180",
  ),
});

export const readConfigs = ({
  GDASH_MODE,
  env,
}: {
  GDASH_MODE:
    | "ORGANIZATION_APP"
    | "SINGLE_REPOSITORY"
    | "PERSONAL"
    | "PERSONAL_SAMPLE";
  env: { [key: string]: string | undefined };
}) => {
  switch (GDASH_MODE) {
    case "ORGANIZATION_APP":
      return v.parse(envSchemaOrganizationAppMode, {
        ...env,
        GDASH_MODE: "ORGANIZATION_APP",
      });
    case "SINGLE_REPOSITORY":
      return v.parse(envSchemaSingleRepositoryMode, {
        ...env,
        GDASH_MODE: "SINGLE_REPOSITORY",
      });
    case "PERSONAL":
      return v.parse(envSchemaPersonalMode, { ...env, GDASH_MODE: "PERSONAL" });
    case "PERSONAL_SAMPLE":
      return v.parse(envSchemaPersonalSampleMode, {
        ...env,
        GDASH_MODE: "PERSONAL_SAMPLE",
      });
    // exhaustive check
    default: {
      const _exhaustiveCheck: never = GDASH_MODE;
      return _exhaustiveCheck;
    }
  }
};

export type Configs = ReturnType<typeof readConfigs>;

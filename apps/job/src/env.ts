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
  // GDASH_GITHUB_PERSONAL_ACCESS_TOKEN: string(),
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
  // TODO: enable report to workspace
  // GDASH_WORKSPACE_ID: v.pipe(v.string(), v.minLength(3)),
  // GDASH_WORKSPACE_API_KEY: v.pipe(v.string(), v.minLength(5)),
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
    "30",
  ),
});

export const readConfigs = ({
  GDASH_MODE,
  env,
}: {
  GDASH_MODE: "ORGANIZATION_APP" | "SINGLE_REPOSITORY" | "PERSONAL";
  env: { [key: string]: string | undefined };
}) => {
  switch (GDASH_MODE) {
    case "ORGANIZATION_APP":
      return v.parse(envSchemaOrganizationAppMode, {
        ...env,
        GDASH_MODE: "ORGANIZATION_APP",
      });
    case "SINGLE_REPOSITORY":
      throw Error("Not implemented yet");
    case "PERSONAL":
      return v.parse(envSchemaPersonalMode, { ...env, GDASH_MODE: "PERSONAL" });
    // exhaustive check
    default: {
      const _exhaustiveCheck: never = GDASH_MODE;
      return _exhaustiveCheck;
    }
  }
};

export type Configs = ReturnType<typeof readConfigs>;

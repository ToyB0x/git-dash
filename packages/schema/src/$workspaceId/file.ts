import * as v from "valibot";

const version = "0.1" as const;
const typeName = "$workspaceId.file" as const;

const schema = v.object({
  reportId: v.string(),
  type: v.literal(typeName),
  version: v.literal(version), // latest version
  stats: v.object({
    data: v.string(),
  }),
});

const fixture = {
  reportId: "1",
  type: typeName,
  version: version,
  stats: { data: "" },
} satisfies Schema;

export const stat = {
  type: typeName,
  version: version,
  schema,
  fixture,
};

export type Schema = v.InferInput<typeof schema>;

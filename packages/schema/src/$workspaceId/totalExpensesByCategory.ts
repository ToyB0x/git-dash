import * as v from "valibot";

const version = "0.1" as const;
const typeName = "$workspaceId.cost" as const;

const schema = v.object({
  reportId: v.string(),
  type: v.literal(typeName),
  version: v.literal(version), // latest version
  stats: v.array(
    v.object({
      category: v.string(),
      cost: v.number(),
    }),
  ),
});

const fixture = {
  reportId: "1",
  type: typeName,
  version: version,
  // TODO: use mock data
  stats: [],
} satisfies Schema;

export const stat = {
  type: typeName,
  version: version,
  schema,
  fixture,
};

export type Schema = v.InferInput<typeof schema>;

import * as v from "valibot";

const version = "0.1" as const;
const typeName = "$workspaceId.cost" as const;

const schema = v.object({
  reportId: v.string(),
  type: v.literal(typeName),
  version: v.literal(version), // latest version
  stats: v.object({
    date: v.string(),
    cost: v.number(),
  }),
});

const fixture = {
  reportId: "1",
  type: typeName,
  version: version,
  stats: { date: new Date().toDateString(), cost: 11.2 },
} satisfies Schema;

export const stat = {
  type: typeName,
  version: version,
  schema,
  fixture,
};

export type Schema = v.InferInput<typeof schema>;

import * as v from "valibot";

const version = "0.1" as const;
const typeName = "$workspaceId.repositories" as const;

const schema = v.object({
  reportId: v.string(),
  type: v.literal(typeName),
  version: v.literal(version), // latest version
  stats: v.array(
    v.object({
      name: v.string(), // repositoryName
      updatedAt: v.number(),
    }),
  ),
});

const fixture = {
  reportId: "1",
  type: typeName,
  version: version,
  stats: [
    { name: "repository1", updatedAt: Date.now() },
    { name: "repository2", updatedAt: Date.now() },
  ],
} satisfies Schema;

export const stat = {
  type: typeName,
  version: version,
  schema,
  fixture,
};

export type Schema = v.InferInput<typeof schema>;

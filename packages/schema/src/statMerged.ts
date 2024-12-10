import * as v from "valibot";

const version = "1.0";
const typeName = "statMerged";

const schema = v.object({
  reportId: v.string(),
  groupId: v.string(),
  type: v.literal(typeName),
  version: v.literal(version), // latest version
  data: v.array(
    v.object({
      login: v.string(),
      count: v.number(),
    }),
  ),
});

const fixture = {
  groupId: "2edd4c47-b01c-49eb-9711-5e8106bbabcf",
  reportId: "1",
  type: typeName,
  version: version,
  data: [
    { login: "user1", count: 10 },
    { login: "user2", count: 10 },
  ],
} satisfies Schema;

export const stat = {
  type: typeName,
  schema,
  fixture,
};

export type Schema = v.InferInput<typeof schema>;

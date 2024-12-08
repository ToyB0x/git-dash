import * as v from "valibot";

const typeName = "statMerged";

const schema = v.object({
  reportId: v.string(),
  teamId: v.pipe(v.string(), v.uuid()),
  type: v.literal(typeName),
  version: v.literal("1.0"), // latest version
  data: v.array(
    v.object({
      login: v.string(),
      count: v.number(),
    }),
  ),
});

const fixture = {
  teamId: "2edd4c47-b01c-49eb-9711-5e8106bbabcf",
  reportId: "1",
  type: "statMerged",
  version: "1.0",
  data: [
    { login: "user1", count: 10 },
    { login: "user2", count: 10 },
  ],
} satisfies StatMergedSchema;

export const statMerged = {
  type: typeName,
  schema,
  fixture,
};

export type StatMergedSchema = v.InferInput<typeof schema>;

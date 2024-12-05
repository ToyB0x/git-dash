import * as v from "valibot";

export const statMergedSchema = v.object({
  reportId: v.pipe(v.string(), v.uuid()),
  teamId: v.pipe(v.string(), v.uuid()),
  type: v.literal("statMerged"),
  version: v.literal("1.0"),
  data: v.array(
    v.object({
      login: v.string(),
      count: v.number(),
    }),
  ),
});

export type StatMergedSchema = v.InferInput<typeof statMergedSchema>;

export const statMergedFixture = {
  teamId: "2edd4c47-b01c-49eb-9711-5e8106bbabcf",
  reportId: "4a9534d0-3f69-4164-abd8-1830310832ce",
  type: "statMerged",
  version: "1.0",
  data: [
    { login: "user1", count: 10 },
    { login: "user2", count: 10 },
  ],
} satisfies StatMergedSchema;

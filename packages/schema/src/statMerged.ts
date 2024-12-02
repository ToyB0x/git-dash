import * as v from "valibot";

const statMergedSchema = v.object({
  name: v.literal("statMerged"),
  version: v.literal("1.0"),
  data: v.array(
    v.object({
      login: v.string(),
      count: v.number(),
    }),
  ),
});

export type StatMergedSchema = v.InferInput<typeof statMergedSchema>;

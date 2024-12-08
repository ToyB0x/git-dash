import {
  statMergedSchema,
  statMergedSchemaType,
} from "@repo/schema/statMerged";
import * as v from "valibot";
import { client } from "~/.client/hono";

export const fetchStatMerged = async () => {
  const res = await client.reports[":type"].$get({
    param: {
      type: statMergedSchemaType,
    },
  });

  if (!res.ok) throw Error("Failed to fetch");

  return v.parse(statMergedSchema, await res.json());
};

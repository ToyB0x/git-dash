import { type StatMergedSchema, statMerged } from "@repo/schema/statMerged";
import * as v from "valibot";
import { client } from "~/.client/hono";

export const fetchReport = async (
  token: string,
  type: string,
): Promise<StatMergedSchema> => {
  const res = await client.reports[":type"].$get(
    {
      param: {
        type,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) throw Error("Failed to fetch");

  if (type === statMerged.type) {
    return v.parse(statMerged.schema, await res.json());
  }
  throw Error("Unknown type");
};

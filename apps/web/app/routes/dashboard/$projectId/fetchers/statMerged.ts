import { type StatMergedSchema, statMerged } from "@repo/schema/statMerged";
import * as v from "valibot";
import { client } from "~/.client/hono";

type Result<T> =
  | {
      success: true;
      data: T | null;
    }
  | {
      success: false;
    };

export const fetchReport = async (
  token: string,
  type: string,
  teamId: string,
): Promise<Result<StatMergedSchema>> => {
  try {
    const res = await client.reports[":teamId"][":type"].$get(
      {
        param: {
          type,
          teamId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) throw Error("Failed to fetch");

    const data = await res.json();
    if (data === null) return { success: true, data: null };

    if (type === statMerged.type) {
      return {
        success: true,
        data: v.parse(statMerged.schema, data),
      };
    }

    throw Error("Unknown type");
  } catch (e) {
    console.error(e);
    return { success: false };
  }
};

import * as v from "valibot";
import type { BaseIssue, BaseSchema } from "valibot";
import { client } from "~/.client/hono";

type Result<T> =
  | {
      success: true;
      data: T | null;
    }
  | {
      success: false;
    };

export const fetchReport = async <Schema>(
  token: string,
  type: string,
  groupId: string,
  schema: BaseSchema<unknown, Schema, BaseIssue<unknown>>,
): Promise<Result<Schema>> => {
  try {
    const res = await client.api.reports[":groupId"][":type"].$get(
      {
        param: {
          type,
          groupId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      return { success: false };
    }

    const data = await res.json();
    if (data === null) return { success: true, data: null };

    return {
      success: true,
      data: v.parse(schema, data),
    };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
};

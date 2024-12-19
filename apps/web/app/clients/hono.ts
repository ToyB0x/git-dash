import { publicViteEnv } from "@/env";
import { hcWithType } from "@repo/api/hc";
import * as v from "valibot";
import type { BaseIssue, BaseSchema } from "valibot";

export const hc = hcWithType(publicViteEnv.VITE_PUBLIC_API_SERVER_URL);

type Result<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
    };

export const fetchReport = async <Schema>(
  token: string,
  type: string,
  workspaceId: string,
  schema: BaseSchema<unknown, Schema, BaseIssue<unknown>>,
): Promise<Result<Schema>> => {
  try {
    const res = await hc.api.reports[":workspaceId"][":type"].$get(
      {
        param: {
          type,
          workspaceId,
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
    if (data === null) return { success: false };

    return {
      success: true,
      data: v.parse(schema, data),
    };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
};

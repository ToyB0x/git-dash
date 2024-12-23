import type { Schema } from "@repo/schema/statMerged";
import { getSingleTenantPrismaClient } from "../../../../utils";

export const countOnce = async (
  organizationId: string,
  groupId: string,
  reportId: string,
  days: number,
) => {
  const prisma = getSingleTenantPrismaClient();
  const usersWithMergeCount = await prisma.user.findMany({
    where: {
      organizationId,
    },
    select: {
      login: true,
      _count: {
        select: {
          Prs: {
            where: {
              organizationId,
              mergedAt: {
                gte: new Date(Date.now() - 60 * 60 * 24 * 1000 * days),
              },
            },
          },
        },
      },
    },
  });

  return {
    reportId,
    groupId,
    type: "statMerged",
    version: "1.0",
    data: usersWithMergeCount.map((user) => ({
      login: user.login,
      count: user._count.Prs,
    })),
  } satisfies Schema;
};

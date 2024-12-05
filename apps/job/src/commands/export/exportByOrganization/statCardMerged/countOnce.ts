import type { StatMergedSchema } from "@repo/schema/statMerged";
import { getSingleTenantPrismaClient } from "../../../../utils";

export const countOnce = async (organizationId: string, days: number) => {
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
    // TODO: use real  teamId / reportId
    teamId: "2edd4c47-b01c-49eb-9711-5e8106bbabcf",
    reportId: "4a9534d0-3f69-4164-abd8-1830310832ce",
    type: "statMerged",
    version: "1.0",
    data: usersWithMergeCount.map((user) => ({
      login: user.login,
      count: user._count.Prs,
    })),
  } satisfies StatMergedSchema;
};

import type { Schema } from "@repo/schema/statReviews";
import { getSingleTenantPrismaClient } from "../../../../utils";

export const countReviewsStat = async (
  organizationId: string,
  groupId: string,
  reportId: string,
  days: number,
) => {
  const prisma = getSingleTenantPrismaClient();
  const usersWithReviewsCount = await prisma.organization.findUniqueOrThrow({
    where: {
      id: organizationId,
    },
    select: {
      id: true,
      Users: {
        where: {
          id: {
            not: "BOT_kgDOAbying", // renovate id
          },
        },
        select: {
          login: true,
          Reviews: {
            select: {
              id: true,
            },
            where: {
              createdAt: {
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
    type: "statReviews",
    version: "1.0",
    data: usersWithReviewsCount.Users.map((user) => ({
      login: user.login,
      count: user.Reviews.length,
    })),
  } satisfies Schema;
};

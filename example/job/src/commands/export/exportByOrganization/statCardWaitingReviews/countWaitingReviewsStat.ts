import type { Schema } from "@repo/schema/statWaitingReviews";
import { getSingleTenantPrismaClient } from "../../../../utils";

export const countWaitingReviewsStat = async (
  organizationId: string,
  groupId: string,
  reportId: string,
  days: number,
) => {
  const prisma = getSingleTenantPrismaClient();

  const organization = await prisma.organization.findUniqueOrThrow({
    where: {
      id: organizationId,
    },
    select: {
      id: true,
      Prs: {
        where: {
          merged: false,
          closed: false,
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 24 * 1000 * days),
          },
        },
        select: {
          id: true,
          authorId: true,
          Reviews: {
            select: {
              id: true,
              authorId: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                },
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
    type: "statWaitingReviews",
    version: "1.0",
    data: organization.Prs
      // セルフレビューは除外しつつ、他人からのレビューがついていないもの
      .filter((pr) =>
        pr.Reviews.filter((review) => review.user.id !== pr.authorId),
      )
      .map((pr) => ({
        login: pr.authorId, // PRの作成者
        count: pr.Reviews.length,
      })),
  } satisfies Schema;
};

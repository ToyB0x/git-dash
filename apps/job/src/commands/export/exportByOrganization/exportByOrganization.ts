import { client } from "../../../clients/hono";
import { getSingleTenantPrismaClient } from "../../../utils";
import { countOnce } from "./statCardMerged";
import { countReviewsStat } from "./statCardReviews";
import { countWaitingReviewsStat } from "./statCardWaitingReviews";

export const exportByOrganization = async (
  orgName: string,
  groupId: string,
  groupApiKey: string,
): Promise<void> => {
  const resPostMeta = await client["public-api"]["reports-meta"][
    ":groupId"
  ].$post(
    {
      param: { groupId },
    },
    {
      headers: {
        "X-GDASH-GROUP-ID": groupId,
        "X-GDASH-GROUP-API-KEY": groupApiKey,
      },
    },
  );
  if (!resPostMeta.ok) throw Error("Failed to create report-meta");

  const { id: reportId } = await resPostMeta.json();

  const prisma = getSingleTenantPrismaClient();
  const { id: organizationId } = await prisma.organization.findUniqueOrThrow({
    where: { login: orgName },
  });

  const mergedCount = await countOnce(organizationId, groupId, reportId, 30);
  await client["public-api"].reports.$post(
    { json: mergedCount },
    {
      headers: {
        "X-GDASH-GROUP-ID": groupId,
        "X-GDASH-GROUP-API-KEY": groupApiKey,
      },
    },
  );

  const reviewsCount = await countReviewsStat(
    organizationId,
    groupId,
    reportId,
    30,
  );

  await client["public-api"].reports.$post(
    { json: reviewsCount },
    {
      headers: {
        "X-GDASH-GROUP-ID": groupId,
        "X-GDASH-GROUP-API-KEY": groupApiKey,
      },
    },
  );

  const reviewsWaitingCount = await countWaitingReviewsStat(
    organizationId,
    groupId,
    reportId,
    30,
  );

  await client["public-api"].reports.$post(
    { json: reviewsWaitingCount },
    {
      headers: {
        "X-GDASH-GROUP-ID": groupId,
        "X-GDASH-GROUP-API-KEY": groupApiKey,
      },
    },
  );

  await client["public-api"]["reports-meta"][":groupId"].$patch(
    {
      param: { groupId },
      json: {
        reportId,
        groupId,
        status: "FINISHED",
      },
    },
    {
      headers: {
        "X-GDASH-GROUP-ID": groupId,
        "X-GDASH-GROUP-API-KEY": groupApiKey,
      },
    },
  );

  console.log("Export Done!");
};

import { client } from "../../../clients/hono";
import { getSingleTenantPrismaClient } from "../../../utils";
import { countOnce } from "./statCardMerged";

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

  const mergedCount = await countOnce(organizationId, groupId, reportId, 90);

  console.log(JSON.stringify(mergedCount, null, 2));

  await client["public-api"].reports.$post({ json: mergedCount });
  await client["public-api"]["reports-meta"][":groupId"].$patch(
    {
      param: { groupId },
      json: {
        reportId,
        groupId: "2edd4c47-b01c-49eb-9711-5e8106bbabcf",
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
};

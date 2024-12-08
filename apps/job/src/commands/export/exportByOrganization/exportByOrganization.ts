import { client } from "../../../clients/hono";
import { getSingleTenantPrismaClient } from "../../../utils";
import { countOnce } from "./statCardMerged";

export const exportByOrganization = async (orgName: string): Promise<void> => {
  const resPostMeta = await client["reports-meta"].public.$post();
  if (!resPostMeta.ok) throw Error("Failed to create report");

  const { publicId: reportPublicId } = await resPostMeta.json();

  const prisma = getSingleTenantPrismaClient();
  const { id: organizationId } = await prisma.organization.findUniqueOrThrow({
    where: { login: orgName },
  });

  const mergedCount = await countOnce(organizationId, reportPublicId, 90);

  console.log(JSON.stringify(mergedCount, null, 2));

  await client.reports.public.$post({ json: mergedCount });
  await client["reports-meta"].public.$patch({
    json: {
      reportPublicId,
      teamId: "2edd4c47-b01c-49eb-9711-5e8106bbabcf",
      status: "FINISHED",
    },
  });
};

import { client } from "../../../clients/hono";
import { getSingleTenantPrismaClient } from "../../../utils";
import { countOnce } from "./statCardMerged";

export const exportByOrganization = async (orgName: string): Promise<void> => {
  const resPostMeta = await client["reports-meta"].$post();
  if (!resPostMeta.ok) throw Error("Failed to create report");

  const { id: reportId } = await resPostMeta.json();

  const prisma = getSingleTenantPrismaClient();
  const { id: organizationId } = await prisma.organization.findUniqueOrThrow({
    where: { login: orgName },
  });

  const mergedCount = await countOnce(organizationId, reportId, 90);

  console.log(JSON.stringify(mergedCount, null, 2));

  await client.reports.$post({ json: mergedCount });
};

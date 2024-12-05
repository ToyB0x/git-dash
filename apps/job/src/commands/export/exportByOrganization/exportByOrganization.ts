import { getSingleTenantPrismaClient } from "../../../utils";
import { countOnce } from "./statCardMerged";

export const exportByOrganization = async (orgName: string): Promise<void> => {
  const prisma = getSingleTenantPrismaClient();
  const { id: organizationId } = await prisma.organization.findUniqueOrThrow({
    where: { login: orgName },
  });

  const mergedCount = await countOnce(organizationId, 90);
  console.log(JSON.stringify(mergedCount, null, 2));

  // TODO: use url from Env
  const res = await fetch("http://localhost:8787/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mergedCount),
  });

  console.log(await res.json());
};

import type { AppType } from "@repo/api";
import { hc } from "hono/client";
import { getSingleTenantPrismaClient } from "../../../utils";
import { countOnce } from "./statCardMerged";

// TODO: split to /client
// TODO: use url from Env
const client = hc<AppType>("http://localhost:8787/");

export const exportByOrganization = async (orgName: string): Promise<void> => {
  const resHC = await client["reports-meta"].$post();
  if (!resHC.ok) throw Error("Failed to create report");

  const { id: reportId } = await resHC.json();

  const prisma = getSingleTenantPrismaClient();
  const { id: organizationId } = await prisma.organization.findUniqueOrThrow({
    where: { login: orgName },
  });

  const mergedCount = await countOnce(organizationId, reportId, 90);

  console.log(JSON.stringify(mergedCount, null, 2));

  await client.reports.$post({ json: mergedCount });
};

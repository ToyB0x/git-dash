import { hc } from "@/clients";
import { step } from "@/utils";
import { cost } from "./cost";
import { prepare } from "./prepare";
import { repositories } from "./repositories";
import { usage } from "./usage";

export const exportByOrganization = async (
  workspaceId: string,
): Promise<void> => {
  const { scanId, reportId } = await step({
    stepName: "export:prepare",
    callback: prepare(),
  });

  await step({
    stepName: "export:repositories",
    callback: repositories(reportId),
  });

  await step({
    stepName: "export:cost",
    callback: cost({ scanId, reportId }),
  });

  await step({
    stepName: "export:usage",
    callback: usage({ scanId, reportId }),
  });

  // send finish status
  await hc["public-api"]["reports-meta"][":workspaceId"].$patch({
    param: { workspaceId },
    json: {
      reportId,
      workspaceId,
      status: "FINISHED",
    },
  });

  console.log("Export Done!");
};

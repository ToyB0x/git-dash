import { dbClient } from "@/clients";
import { step } from "@/utils";
// import { aggregate } from "./actions-detail";
import { aggregate as accregateActionsUsageCurrentCycle } from "./actions-usage-current-cycle";
// import { aggregate as aggregateExpense } from "./expense";
// import { aggregate } from "./actions-summary";
// import { aggregateOrganization } from "./organization";
import { aggregate as aggregateRepositories } from "./repositories";
import { aggregate as aggregateWorkflow } from "./workflow";
import { aggregate as workflowUsageCurrentCycle } from "./workflow-usage-current-cycle";
// import { aggregatePRs } from "./aggregatePRs";
// import { aggregateUsers } from "./aggregateUsers";

export const maxOld = new Date(
  Date.now() - 6 /* month */ * 60 * 60 * 24 * 30 * 1000,
).getTime();

export const aggregateByOrganization = async (
  orgName: string,
): Promise<void> => {
  const { id: scanId } = await dbClient.scan.create({
    data: {
      status: "RUNNING",
    },
  });

  // const organization = await step({
  //   stepName: "aggregate:organization",
  //   callback: aggregateOrganization(orgName),
  // });

  // currently unused
  // await step({
  //   stepName: "aggregate:expense",
  //   callback: aggregateExpense(orgName, scanId),
  // });

  const repositories = await step({
    stepName: "aggregate:repository",
    callback: aggregateRepositories(),
  });

  await step({
    stepName: "aggregate:workflow",
    callback: aggregateWorkflow(repositories),
  });

  // await step({
  //   stepName: "aggregate:actions-cost-summary",
  //   callback: aggregate(orgName, scanId, repositories),
  // });

  // comment out to avoid heavy quota consumption
  // await step({
  //   stepName: "aggregate:actions-cost-detail",
  //   callback: aggregate(orgName, scanId, repositories),
  // });

  // comment out to avoid heavy quota consumption
  await step({
    stepName: "aggregate:actions-usage-current-cycle",
    callback: accregateActionsUsageCurrentCycle(orgName, scanId),
  });

  // comment out to avoid heavy quota consumption
  await step({
    stepName: "aggregate:workflow-usage-current-cycle",
    callback: workflowUsageCurrentCycle(),
  });

  // await aggregateUsers(orgName, organizationId);
  // if (repositoryNames.length !== new Set(repositoryNames).size)
  //   throw new Error("duplicate repository name");
  //
  // for (const [index, repositoryName] of repositoryNames.entries()) {
  //   console.info(`trying repository: ${index + 1} / ${repositoryNames.length}`);
  //   await aggregatePRs(orgName, organizationId, repositoryName);
  // }
};

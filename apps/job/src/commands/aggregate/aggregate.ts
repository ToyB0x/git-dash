import { step } from "@/utils";
import { aggregate as aggregateRepositories } from "./repositories";
import { aggregate as aggregateWorkflow } from "./workflow";
import { aggregate as aggregateWorkflowRun } from "./workflow-run";
import { aggregate as workflowUsageCurrentCycle } from "./workflow-usage-current-cycle";
import { aggregate as workflowUsageCurrentCycleByRunner } from "./workflow-usage-current-cycle-by-runner";

export const maxOld = new Date(
  Date.now() - 6 /* month */ * 60 * 60 * 24 * 30 * 1000,
).getTime();

export const aggregateByOrganization = async (): Promise<void> => {
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

  await step({
    stepName: "aggregate:workflow-run",
    callback: aggregateWorkflowRun(repositories),
  });

  await step({
    stepName: "aggregate:workflow-usage-current-cycle",
    callback: workflowUsageCurrentCycle(),
  });

  await step({
    stepName: "aggregate:workflow-usage-current-cycle-by-runner",
    callback: workflowUsageCurrentCycleByRunner(),
  });
};

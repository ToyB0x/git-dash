import { dbClient, getOctokit } from "@/clients";
import { logger } from "@/utils";

export const aggregate = async (orgName: string, scanId: number) => {
  const octokit = await getOctokit();

  const billingAction = await octokit.rest.billing.getGithubActionsBillingOrg({
    org: orgName,
  });
  const billingActionsCost = Object.entries(
    billingAction.data.minutes_used_breakdown,
  ).reduce((acc, [runner, minutes]) => {
    // https://docs.github.com/ja/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions#per-minute-rates-for-standard-runners
    switch (runner) {
      case "UBUNTU":
        return acc + minutes * 0.008;
      case "MACOS":
        return acc + minutes * 0.08;
      case "WINDOWS":
        return acc + minutes * 0.016;
      case "ubuntu_4_core":
        return acc + minutes * 0.016;
      case "ubuntu_8_core":
        return acc + minutes * 0.032;
      case "ubuntu_16_core":
        return acc + minutes * 0.064;
      case "ubuntu_32_core":
        return acc + minutes * 0.128;
      case "ubuntu_64_core":
        return acc + minutes * 0.256;
      case "windows_4_core":
        return acc + minutes * 0.032;
      case "windows_8_core":
        return acc + minutes * 0.064;
      case "windows_16_core":
        return acc + minutes * 0.128;
      case "windows_32_core":
        return acc + minutes * 0.256;
      case "windows_64_core":
        return acc + minutes * 0.512;
      case "macos_12_core":
        return acc + minutes * 0.12;
      case "total":
        return acc; // ignore total
      default:
        throw Error("Please Add Runner Type");
    }
  }, 0);

  await dbClient.expense.create({
    data: {
      scanId,
      type: "action",
      cost: billingActionsCost,
    },
  });

  // TODO: handle billing package data
  // const billingPackage = await octokit.rest.billing.getGithubPackagesBillingOrg(
  //   {
  //     org: orgName,
  //   },
  // );
  // logger.info(JSON.stringify(billingPackage.data, null, 2));

  // TODO: handle billing storage data
  // const billingStorage = await octokit.rest.billing.getSharedStorageBillingOrg({
  //   org: orgName,
  // });
  // const billingStorageCost =
  //   billingStorage.data.estimated_paid_storage_for_month * 4;
  // await dbClient.expense.create({
  //   data: {
  //     scanId,
  //     type: "storage",
  //     cost: billingStorageCost,
  //   },
  // });

  const billingSeat = await octokit.rest.orgs.listMembers({
    org: orgName,
  });

  // TODO: change price for team plan / enterprise plan
  const billingSeatCost = billingSeat.data.length * 4;
  await dbClient.expense.create({
    data: {
      scanId,
      type: "seat",
      cost: billingSeatCost,
    },
  });

  const billingCopilot = await octokit.rest.copilot.listCopilotSeats({
    org: orgName,
  });

  // TODO: change price for team plan / enterprise plan
  const billingCopilotCost = (billingCopilot.data.total_seats || 0) * 20;
  await dbClient.expense.create({
    data: {
      scanId,
      type: "copilot",
      cost: billingCopilotCost,
    },
  });

  // // TODO: 直近に更新されていないリポジトリは除外して高速化する
  // let count = 0;
  // for (const repository of repositories) {
  //   logger.info(
  //     `Start aggregate:actions-cost ${repository.name} (${++count}/${repositories.length})`,
  //   );
  //
  //   const workflows = await octokit.rest.actions.listRepoWorkflows({
  //     owner: orgName,
  //     repo: repository.name,
  //   });
  //
  //   for (const workflow of workflows.data.workflows) {
  //     const workflowUsage = await octokit.rest.actions.getWorkflowUsage({
  //       owner: orgName,
  //       repo: repository.name,
  //       workflow_id: workflow.id,
  //     });
  //
  //     for (const [runner, { total_ms }] of Object.entries(
  //       workflowUsage.data.billable,
  //     )) {
  //       await dbClient.workflowUsageRepo.create({
  //         data: {
  //           scanId,
  //           runner,
  //           repositoryId: repository.id,
  //           workflowId: workflow.id,
  //           totalMs: total_ms || 0,
  //         },
  //       });
  //     }
  //   }
  // }

  const rateLimit = await octokit.rest.rateLimit.get();
  logger.info(JSON.stringify(rateLimit.data, null, 2));
};

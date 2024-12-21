import { step } from "@/utils";
import { aggregateOrganization } from "./organization";
import { aggregateRepositories } from "./repositories";
// import { aggregatePRs } from "./aggregatePRs";
// import { aggregateUsers } from "./aggregateUsers";

export const maxOld = new Date(
  Date.now() - 6 /* month */ * 60 * 60 * 24 * 30 * 1000,
).getTime();

export const aggregateByOrganization = async (
  orgName: string,
): Promise<void> => {
  const organization = await step({
    stepName: "aggregate:organization",
    callback: aggregateOrganization(orgName),
  });

  await step({
    stepName: "aggregate:repositories",
    callback: aggregateRepositories(organization.login, organization.id),
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

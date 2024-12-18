import { aggregateOrganization } from "./aggregateOrganization";
import { aggregateRepositories } from "./aggregateRepositories";
// import { aggregatePRs } from "./aggregatePRs";
// import { aggregateUsers } from "./aggregateUsers";

export const maxOld = new Date(
  Date.now() - 6 /* month */ * 60 * 60 * 24 * 30 * 1000,
).getTime();

export const aggregateByOrganization = async (
  orgName: string,
): Promise<void> => {
  console.log("aggregate Organization...", orgName);
  const organization = await aggregateOrganization(orgName);

  console.log("aggregate Repositories...");
  const repositories = await aggregateRepositories(
    organization.login,
    organization.id,
  );
  console.log("aggregate Repositories: ", repositories.length);

  // await aggregateUsers(orgName, organizationId);
  // if (repositoryNames.length !== new Set(repositoryNames).size)
  //   throw new Error("duplicate repository name");
  //
  // for (const [index, repositoryName] of repositoryNames.entries()) {
  //   console.info(`trying repository: ${index + 1} / ${repositoryNames.length}`);
  //   await aggregatePRs(orgName, organizationId, repositoryName);
  // }
};

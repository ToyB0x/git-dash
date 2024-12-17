import { aggregateOrganization } from "./aggregateOrganization";
// import { aggregatePRs } from "./aggregatePRs";
// import { aggregateRepositories } from "./aggregateRepositories";
// import { aggregateUsers } from "./aggregateUsers";

export const maxOld = new Date(
  Date.now() - 6 /* month */ * 60 * 60 * 24 * 30 * 1000,
).getTime();

export const aggregateByOrganization = async (
  orgName: string,
): Promise<void> => {
  const organization = await aggregateOrganization(orgName);
  console.log("organization", organization);
  // await aggregateUsers(orgName, organizationId);
  // const repositoryNames = await aggregateRepositories(orgName, organizationId);
  // if (repositoryNames.length !== new Set(repositoryNames).size)
  //   throw new Error("duplicate repository name");
  //
  // for (const [index, repositoryName] of repositoryNames.entries()) {
  //   console.info(`trying repository: ${index + 1} / ${repositoryNames.length}`);
  //   await aggregatePRs(orgName, organizationId, repositoryName);
  // }
};

import { dbClient, getGhClient } from "@/clients";
import { graphql } from "../../../../../generated/gql";

export const aggregateOrganization = async (orgName: string) => {
  const organizationQuery = graphql(/* GraphQL */ `
    query organization($organization: String!) {
      organization(login: $organization) {
        id
        login
      }
    }
  `);

  const ghClient = await getGhClient();
  const organizationResult = await ghClient.request(organizationQuery, {
    organization: orgName,
  });

  if (!organizationResult.organization) throw Error("null organization");
  await dbClient.organization.upsert({
    where: {
      id: organizationResult.organization.id,
    },
    create: {
      id: organizationResult.organization.id,
      login: organizationResult.organization.login,
    },
    update: {
      login: organizationResult.organization.login,
    },
  });

  return organizationResult.organization;
};

// NOTE: for graphql client with octokit example
// waiting for https://github.com/octokit/graphql.js/pull/609
//
// import { octokitApp } from "@/clients";
//
// export const aggregateOrganization = async (orgName: string) => {
//   const organizationResult = await octokitApp.octokit.graphql({
//     query: /* GraphQL */ `query organization($organization: String!) {
//       organization(login: $organization) {
//         id
//         login
//       }
//     }`,
//     organization: orgName,
//   });
//
//   await dbClient.organization.upsert({
//     where: {
//       id: organizationResult.id,
//     },
//     create: {
//       id: organizationResult.id,
//       login: organizationResult.login,
//     },
//     update: {
//       login: organizationResult.login,
//     },
//   });
//
//   return organizationResult;
// };

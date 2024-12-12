import { GraphQLClient } from "graphql-request";
import { graphql } from "../../../../../generated/gql";
import { env, getSingleTenantPrismaClient } from "../../../../utils";

export const aggregateOrganization = async (
  orgName: string,
): Promise<string> => {
  const prismaSingleTenantClient = getSingleTenantPrismaClient();

  const githubClient = new GraphQLClient("https://api.github.com/graphql", {
    headers: {
      Authorization: `Bearer ${env.APPS_JOBS_GITHUB_PERSONAL_ACCESS_TOKEN}`,
      "X-Github-Next-Global-ID": "1",
    },
  });

  const organizationQuery = graphql(/* GraphQL */ `
    query organization($organization: String!) {
      organization(login: $organization) {
        id
        login
      }
    }
  `);

  const organizationResult = await githubClient.request(organizationQuery, {
    organization: orgName,
  });

  try {
    if (!organizationResult.organization) throw Error("null organization");
    await prismaSingleTenantClient.organization.upsert({
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
    return organizationResult.organization.id;
  } finally {
    await prismaSingleTenantClient.$disconnect();
  }
};

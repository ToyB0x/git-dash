import { dbClient, ghClient } from "@/clients";
import { graphql } from "../../../../../generated/gql";

export const aggregateOrganization = async (
  orgName: string,
): Promise<string> => {
  const organizationQuery = graphql(/* GraphQL */ `
    query organization($organization: String!) {
      organization(login: $organization) {
        id
        login
      }
    }
  `);

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

  return organizationResult.organization.id;
};

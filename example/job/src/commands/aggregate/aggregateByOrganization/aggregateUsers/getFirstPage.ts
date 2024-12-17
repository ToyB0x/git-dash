import type { GraphQLClient } from "graphql-request";
import { graphql } from "../../../../../generated/gql";

export const getFirstPage = async (
  graphQLClient: GraphQLClient,
  orgName: string,
) => {
  const usersQuery = graphql(/* GraphQL */ `
    query users($organization: String!) {
      organization(login: $organization) {
        id
        login
        membersWithRole(first: 100) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              name
              login
              avatarUrl
            }
          }
        }
      }
    }
  `);

  const usersResult = await graphQLClient.request(usersQuery, {
    organization: orgName,
  });

  if (!usersResult.organization) throw Error("null organization");

  if (!usersResult.organization.membersWithRole.edges)
    throw Error("null edges");

  const users = usersResult.organization.membersWithRole.edges.map((e) => {
    if (!e) throw Error("null edge");
    if (!e.node) throw Error("null node");
    return {
      id: e.node.id,
      name: e.node.name,
      login: e.node.login,
      avatarUrl: e.node.avatarUrl,
    };
  });

  return {
    users,
    hasNextPage: usersResult.organization.membersWithRole.pageInfo.hasNextPage,
    cursor: usersResult.organization.membersWithRole.pageInfo.endCursor,
  };
};

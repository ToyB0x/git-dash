import type { GraphQLClient } from "graphql-request";
import { graphql } from "../../../../../generated/gql";

export const paginate = async (
  graphQLClient: GraphQLClient,
  orgName: string,
  cursor: string,
) => {
  const paginateUsersQuery = graphql(/* GraphQL */ `
    query paginateUsers($organization: String!, $after: String) {
      organization(login: $organization) {
        id
        login
        membersWithRole(after: $after, first: 100) {
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

  const paginateUsersResult = await graphQLClient.request(paginateUsersQuery, {
    organization: orgName,
    after: cursor,
  });

  if (!paginateUsersResult.organization) throw Error("null organization");

  if (!paginateUsersResult.organization.membersWithRole.edges)
    throw Error("null edges");

  const paginatedUsers =
    paginateUsersResult.organization.membersWithRole.edges.map((e) => {
      if (!e) throw Error("null edge");
      if (!e.node) throw Error("null node");
      return {
        id: e.node.id,
        name: e.node.name,
        login: e.node.login,
        avatarUrl: e.node.avatarUrl,
      };
    });

  if (!paginateUsersResult.organization.membersWithRole.pageInfo.endCursor)
    throw Error("falsy endCursor");

  return {
    users: paginatedUsers,
    hasNextPage:
      paginateUsersResult.organization.membersWithRole.pageInfo.hasNextPage,
    cursor: paginateUsersResult.organization.membersWithRole.pageInfo.endCursor,
  };
};

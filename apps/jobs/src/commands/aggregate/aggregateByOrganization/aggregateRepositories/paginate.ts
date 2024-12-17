import type { GraphQLClient } from "graphql-request";
import { graphql } from "../../../../../generated/gql";

export const paginate = async (
  graphQLClient: GraphQLClient,
  orgName: string,
  cursor: string | null,
) => {
  const paginateRepositoriesQuery = graphql(/* GraphQL */ `
    query paginateRepositories($organization: String!, $after: String) {
      organization(login: $organization) {
        repositories(
          orderBy: { field: PUSHED_AT, direction: DESC }
          after: $after
          first: 100
        ) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              name
              updatedAt
            }
          }
        }
      }
    }
  `);

  const paginateRepositoriesResult = await graphQLClient.request(
    paginateRepositoriesQuery,
    {
      organization: orgName,
      after: cursor,
    },
  );

  if (!paginateRepositoriesResult.organization)
    throw Error("null organization");

  if (!paginateRepositoriesResult.organization.repositories.edges)
    throw Error("null edges");

  const paginatedRepositories =
    paginateRepositoriesResult.organization.repositories.edges.map((e) => {
      if (!e) throw Error("null edge");
      if (!e.node) throw Error("null node");
      return {
        id: e.node.id,
        name: e.node.name,
        updatedAt: e.node.updatedAt,
      };
    });

  if (!paginateRepositoriesResult.organization.repositories.pageInfo.endCursor)
    throw Error("falsy endCursor");

  return {
    repositories: paginatedRepositories,
    hasNextPage:
      paginateRepositoriesResult.organization.repositories.pageInfo.hasNextPage,
    cursor:
      paginateRepositoriesResult.organization.repositories.pageInfo.endCursor,
  };
};

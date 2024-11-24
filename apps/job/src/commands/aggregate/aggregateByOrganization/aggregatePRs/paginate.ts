import { GraphQLClient } from 'graphql-request'
import { graphql } from '../../../../../generated/gql'
import { UserPR } from './getFirstPage'
import { PaginatePrsQuery } from '../../../../../generated/gql/graphql'

export const paginate = async (
  graphQLClient: GraphQLClient,
  orgName: string,
  repositoryName: string,
  cursor: string,
): Promise<
  | {
      prs: UserPR[]
      hasNextPage: boolean
      cursor: string | undefined | null
    }
  | {
      'retry-after': string
      'x-ratelimit-remaining': string
      'x-ratelimit-reset': string
    }
> => {
  const prsQuery = graphql(/* GraphQL */ `
    query paginatePrs($owner: String!, $name: String!, $after: String) {
      rateLimit {
        limit
        cost
        remaining
      }
      repository(owner: $owner, name: $name) {
        pullRequests(
          orderBy: { field: CREATED_AT, direction: DESC }
          after: $after
          first: 50
        ) {
          edges {
            cursor
            node {
              id
              author {
                __typename
                avatarUrl
                ... on User {
                  id
                  login
                  name
                }
              }
              comments {
                totalCount
              }
              timelineItems(first: 100, itemTypes: REVIEW_REQUESTED_EVENT) {
                nodes {
                  ... on ReviewRequestedEvent {
                    id
                    createdAt
                    actor {
                      ... on User {
                        id
                      }
                    }
                    requestedReviewer {
                      ... on User {
                        id
                      }
                    }
                  }
                }
              }
              # TODO: pagination
              reviews(first: 100) {
                nodes {
                  id
                  url
                  createdAt
                  author {
                    login
                  }
                }
              }
              # TODO: pagination
              commits(first: 100) {
                totalCount
                nodes {
                  id
                  commit {
                    id
                    url
                    committedDate
                    author {
                      user {
                        id
                        login
                        name
                        avatarUrl
                      }
                    }
                  }
                }
              }
              createdAt
              merged
              mergedAt
              additions
              deletions
              changedFiles
              closed
              closedAt
              title
              url
            }
          }
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `)

  const maxRetry = 5
  let tryCount = 0
  let paginatePrsResult: PaginatePrsQuery | null = null
  while (tryCount < maxRetry) {
    try {
      paginatePrsResult = await graphQLClient.request(prsQuery, {
        owner: orgName,
        name: repositoryName,
        after: cursor,
      })
      break
    } catch (e) {
      console.error(e)
    } finally {
      tryCount++
    }
  }

  if (!paginatePrsResult) throw Error('null paginatePrsResult')

  console.log(repositoryName, paginatePrsResult.rateLimit)

  if (!paginatePrsResult.repository) throw Error('null repository')

  if (!paginatePrsResult.repository.pullRequests.edges)
    throw Error('null edges')

  const paginatedPrs = paginatePrsResult.repository.pullRequests.edges
    .map((e) => e?.node)
    .filter<UserPR>((n): n is UserPR => n?.author?.__typename === 'User')
    .map((userPr) => {
      return {
        id: userPr.id,
        title: userPr.title,
        url: userPr.url,
        author: {
          id: userPr.author.id,
          login: userPr.author.login,
          name: userPr.author.name,
          avatarUrl: userPr.author.avatarUrl,
          __typename: 'User' as const,
        },
        comments: {
          totalCount: userPr.comments.totalCount,
        },
        timelineItems: userPr.timelineItems,
        reviews: {
          nodes: userPr.reviews.nodes
            .filter<UserPR['reviews']['nodes'][0]>(
              (n): n is UserPR['reviews']['nodes'][0] => !!n.author,
            )
            .map((n) => ({
              id: n.id,
              url: n.url,
              createdAt: n.createdAt,
              author: {
                login: n.author.login,
              },
            })),
        },
        commits: {
          totalCount: userPr.commits.totalCount,
          nodes: userPr.commits.nodes
            .filter<UserPR['commits']['nodes'][0]>(
              (n): n is UserPR['commits']['nodes'][0] =>
                !!n.commit.author?.user?.id,
            )
            .map((n) => ({
              id: n.id,
              commit: {
                id: n.commit.id,
                url: n.commit.url,
                committedDate: n.commit.committedDate,
                author: {
                  user: {
                    id: n.commit.author.user.id,
                    login: n.commit.author.user.login,
                    name: n.commit.author.user.name,
                    avatarUrl: n.commit.author.user.avatarUrl,
                  },
                },
              },
            })),
        },
        createdAt: userPr.createdAt,
        merged: userPr.merged,
        mergedAt: userPr.mergedAt,
        additions: userPr.additions,
        deletions: userPr.deletions,
        changedFiles: userPr.changedFiles,
        closed: userPr.closed,
        closedAt: userPr.closedAt,
      }
    })

  if (!paginatePrsResult.repository.pullRequests.pageInfo.endCursor)
    throw Error('falsy endCursor')

  return {
    prs: paginatedPrs,
    hasNextPage: paginatePrsResult.repository.pullRequests.pageInfo.hasNextPage,
    cursor: paginatePrsResult.repository.pullRequests.pageInfo.endCursor,
  }
}

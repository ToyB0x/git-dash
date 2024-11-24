import { GraphQLClient } from 'graphql-request'
import { graphql } from '../../../../../generated/gql'
import { PrsQuery } from '../../../../../generated/gql/graphql'

export type UserPR = {
  id: string
  title: string
  url: string
  author: {
    id: string
    avatarUrl: string
    login: string
    name: string | undefined | null
    __typename: 'User'
  }
  comments: {
    totalCount: number
  }
  reviews: {
    nodes: {
      id: string
      url: string
      createdAt: string
      author: {
        login: string
      }
    }[]
  }
  timelineItems: {
    nodes: {
      id: string
      actor: {
        id: string
      }
      createdAt: string
      requestedReviewer: {
        id: string
      }
    }[]
  }
  commits: {
    totalCount: number
    nodes: {
      id: string
      commit: {
        id: string
        url: string
        committedDate: string
        author: {
          user: {
            id: string
            login: string
            avatarUrl: string
            name: string | undefined | null
          }
        }
      }
    }[]
  }
  createdAt: string
  merged: boolean
  mergedAt: string | undefined | null
  additions: number
  deletions: number
  changedFiles: number
  closed: boolean
  closedAt: string | undefined | null
}

export const getFirstPage = async (
  graphQLClient: GraphQLClient,
  orgName: string,
  repositoryName: string,
): Promise<{
  prs: UserPR[]
  hasNextPage: boolean
  cursor: string | undefined | null
}> => {
  const prsQuery = graphql(/* GraphQL */ `
    query prs($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        pullRequests(
          orderBy: { field: UPDATED_AT, direction: DESC }
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
                    actor {
                      ... on User {
                        id
                      }
                    }
                    createdAt
                    requestedReviewer {
                      ... on User {
                        id
                      }
                    }
                  }
                }
              } # TODO: pagination
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
  let prsResult: PrsQuery | null = null
  while (tryCount < maxRetry) {
    try {
      prsResult = await graphQLClient.request(prsQuery, {
        owner: orgName,
        name: repositoryName,
      })
      break
    } catch (e) {
      console.error(e)
    } finally {
      tryCount++
    }
  }

  if (!prsResult) throw Error('null prsResult')
  if (!prsResult?.repository) throw Error('null repository')
  if (!prsResult.repository.pullRequests.edges) throw Error('null edges')

  const prs = prsResult.repository.pullRequests.edges
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

  return {
    prs,
    hasNextPage: prsResult.repository.pullRequests.pageInfo.hasNextPage,
    cursor: prsResult.repository.pullRequests.pageInfo.endCursor,
  }
}

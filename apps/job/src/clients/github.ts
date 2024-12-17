import { GraphQLClient } from "graphql-request";
import { env } from "../utils";

export const githubClient = new GraphQLClient(
  "https://api.github.com/graphql",
  {
    headers: {
      Authorization: `Bearer ${env.GDASH_GITHUB_PERSONAL_ACCESS_TOKEN}`,
      "X-Github-Next-Global-ID": "1",
    },
  },
);

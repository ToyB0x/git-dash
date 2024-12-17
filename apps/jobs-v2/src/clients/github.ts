import { env } from "@/env";
import { GraphQLClient } from "graphql-request";

export const ghClient = new GraphQLClient("https://api.github.com/graphql", {
  headers: {
    Authorization: `Bearer ${env.GDASH_GITHUB_PERSONAL_ACCESS_TOKEN}`,
    "X-Github-Next-Global-ID": "1",
  },
});

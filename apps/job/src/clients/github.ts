import { env } from "@/env";
import { GraphQLClient } from "graphql-request";
import { App } from "octokit";

// TODO: in the future, we should use octokit-client directly in the app
// (waiting for https://github.com/octokit/graphql.js/pull/609)
export const octokitApp = new App({
  appId: env.GDASH_GITHUB_INTERNAL_APP_ID,
  privateKey: env.GDASH_GITHUB_INTERNAL_APP_PRIVATE_KEY_STRING,
});

const { data: slug } = await octokitApp.octokit.rest.apps.getAuthenticated();
console.debug({ slug });

const { data: getInstallationResult } =
  await octokitApp.octokit.rest.apps.getOrgInstallation({
    org: env.GDASH_GITHUB_ORGANIZATION_NAME,
  });

console.debug({ installation_id: getInstallationResult.id });

const {
  data: { token },
} = await octokitApp.octokit.rest.apps.createInstallationAccessToken({
  installation_id: getInstallationResult.id,
});

export const ghClient = new GraphQLClient("https://api.github.com/graphql", {
  headers: {
    Authorization: `Bearer ${token}`,
    "X-Github-Next-Global-ID": "1",
  },
});

// NOTE: if you need extend octokit app with installationId
// export const octokit = await octokitApp.getInstallationOctokit(
//   getInstallationResult.id,
// );

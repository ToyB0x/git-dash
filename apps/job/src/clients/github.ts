import { env } from "@/env";
import { logger } from "@/utils";
import { GraphQLClient } from "graphql-request";
import { App } from "octokit";

// TODO: in the future, we should use octokit-client directly in the app
// (waiting for https://github.com/octokit/graphql.js/pull/609)
export const octokitApp = new App({
  appId: env.GDASH_GITHUB_INTERNAL_APP_ID,
  privateKey: env.GDASH_GITHUB_INTERNAL_APP_PRIVATE_KEY_STRING,
});

export const getGhClient = async () => {
  const { data: slug } = await octokitApp.octokit.rest.apps.getAuthenticated();

  logger.debug({ slug });

  const { data: getInstallationResult } =
    await octokitApp.octokit.rest.apps.getOrgInstallation({
      org: env.GDASH_GITHUB_ORGANIZATION_NAME,
    });

  logger.debug({ installation_id: getInstallationResult.id });

  const {
    data: { token },
  } = await octokitApp.octokit.rest.apps.createInstallationAccessToken({
    installation_id: getInstallationResult.id,
  });

  return new GraphQLClient("https://api.github.com/graphql", {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Github-Next-Global-ID": "1",
    },
  });
};

// NOTE: if you need extend octokit app with installationId
export const getOctokit = async () => {
  const { data: slug } = await octokitApp.octokit.rest.apps.getAuthenticated();

  logger.debug({ slug });

  const { data: getInstallationResult } =
    await octokitApp.octokit.rest.apps.getOrgInstallation({
      org: env.GDASH_GITHUB_ORGANIZATION_NAME,
    });

  logger.debug({ installation_id: getInstallationResult.id });

  return await octokitApp.getInstallationOctokit(getInstallationResult.id);
};

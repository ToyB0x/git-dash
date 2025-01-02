import { execSync } from "node:child_process";
import type { Configs } from "@/env";
import { logger } from "@/utils";
import { App, Octokit } from "octokit";

export const getOctokit = async (configs: Configs) => {
  switch (configs.GDASH_MODE) {
    case "ORGANIZATION_APP":
      return await getOctokitApp(configs);
    // case "SINGLE_REPOSITORY":
    // throw Error("Not implemented yet");
    case "PERSONAL":
      return await getPersonalOctokit();
    case "PERSONAL_SAMPLE":
      return await getPersonalOctokit();
    // exhaustive check
    default: {
      throw Error("Invalid GDASH_MODE");
      // const _exhaustiveCheck: never = configs.GDASH_MODE;
      // return _exhaustiveCheck;
    }
  }
};

// NOTE: if you need extend octokit app with installationId
export const getOctokitApp = async (configs: Configs) => {
  if (configs.GDASH_MODE !== "ORGANIZATION_APP")
    throw Error("Invalid GDASH_MODE");

  // TODO: in the future, we should use octokit-client directly in the app
  // (waiting for https://github.com/octokit/graphql.js/pull/609)
  const octokitApp = new App({
    appId: configs.GDASH_GITHUB_INTERNAL_APP_ID,
    privateKey: configs.GDASH_GITHUB_INTERNAL_APP_PRIVATE_KEY_STRING,
  });

  const { data: slug } = await octokitApp.octokit.rest.apps.getAuthenticated();

  logger.debug({ slug });

  const { data: getInstallationResult } =
    await octokitApp.octokit.rest.apps.getOrgInstallation({
      org: configs.GDASH_GITHUB_ORGANIZATION_NAME,
    });

  logger.debug({ installation_id: getInstallationResult.id });

  return await octokitApp.getInstallationOctokit(getInstallationResult.id);
};

export const getPersonalOctokit = async () => {
  try {
    const stdout = execSync("gh auth token");
    const oauthToken = stdout.toString().trim();

    return new Octokit({
      auth: oauthToken,
    });
  } catch (e) {
    console.error(e);
    console.error("Please install Github CLI and set it up first.");
    process.exit(1);
  }
};

// NOTE: if you need graphql client
//
// import { GraphQLClient } from "graphql-request";
//
// export const getGhClient = async () => {
//   const { data: slug } = await octokitApp.octokit.rest.apps.getAuthenticated();
//
//   logger.debug({ slug });
//
//   const { data: getInstallationResult } =
//     await octokitApp.octokit.rest.apps.getOrgInstallation({
//       org: env.GDASH_GITHUB_ORGANIZATION_NAME,
//     });
//
//   logger.debug({ installation_id: getInstallationResult.id });
//
//   const {
//     data: { token },
//   } = await octokitApp.octokit.rest.apps.createInstallationAccessToken({
//     installation_id: getInstallationResult.id,
//   });
//
//   return new GraphQLClient("https://api.github.com/graphql", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "X-Github-Next-Global-ID": "1",
//     },
//   });
// };

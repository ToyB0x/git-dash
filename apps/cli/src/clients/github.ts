import { execSync } from "node:child_process";
import { type Configs, GDASH_MODES } from "@/env";
import { logger } from "@/utils";
import { throttling } from "@octokit/plugin-throttling";
import { App, Octokit } from "octokit";

export const getOctokit = async (configs: Configs) => {
  const mode = configs.GDASH_MODE;
  switch (mode) {
    case GDASH_MODES.ORGANIZATION_APP:
      return await getOctokitApp(configs);
    case GDASH_MODES.SINGLE_REPOSITORY:
      return await getOctokitWithToken(configs.GITHUB_TOKEN);
    case GDASH_MODES.SAMPLE:
      return await getOctokitWithToken(getTokenFromGhCommand());
    // exhaustive check
    default: {
      const _exhaustiveCheck: never = mode;
      return _exhaustiveCheck;
    }
  }
};

// NOTE: if you need extend octokit app with installationId
export const getOctokitApp = async (configs: Configs) => {
  if (configs.GDASH_MODE !== GDASH_MODES.ORGANIZATION_APP)
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

export const getOctokitWithToken = async (githubToken: string) => {
  Octokit.plugin(throttling);

  return new Octokit({
    auth: githubToken,
    throttle: {
      onRateLimit: (retryAfter, options, octokit, retryCount) => {
        octokit.log.warn(
          `Request quota exhausted for request ${options.method} ${options.url}`,
        );

        if (retryCount < 1) {
          // only retries once
          octokit.log.info(`Retrying after ${retryAfter} seconds!`);
          return true;
        }

        return false;
      },
      onSecondaryRateLimit: (retryAfter, options, octokit) => {
        // does not retry, only logs a warning
        octokit.log.warn(
          `SecondaryRateLimit detected for request ${options.method} ${options.url}, retrying after ${retryAfter} seconds!`,
        );
      },
    },
  });
};

const getTokenFromGhCommand = () => {
  try {
    const stdout = execSync("gh auth token");
    return stdout.toString().trim();
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

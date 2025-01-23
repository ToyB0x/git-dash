import * as github from "@actions/github";

const tagName = process.argv[2];
if (!tagName) throw Error("Missing tag name");
if (!["dev", "stg", "prd"].includes(tagName)) throw Error("Invalid tag name");

console.log(`Updating tag: ${tagName}`);

const { GITHUB_SHA, GITHUB_TOKEN } = process.env;

if (!GITHUB_SHA || !GITHUB_TOKEN)
  throw Error("Missing GITHUB_SHA or GITHUB_TOKEN");

const octokit = github.getOctokit(GITHUB_TOKEN);
try {
  // if tag exists, update it
  await octokit.rest.git.getRef({
    ...github.context.repo,
    ref: `tags/${tagName}`,
  });

  await octokit.rest.git.updateRef({
    ...github.context.repo,
    ref: `tags/${tagName}`,
    sha: GITHUB_SHA,
  });
} catch (e) {
  // if tag does not exist, create it
  // @ts-ignore
  if (e.status === 404) {
    await octokit.rest.git.createRef({
      ...github.context.repo,
      ref: `refs/tags/${tagName}`,
      sha: GITHUB_SHA,
    });
  } else {
    throw e;
  }
}

// ref: https://github.com/richardsimko/update-tag

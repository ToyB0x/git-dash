import type { getDbClient, getOctokit } from "@/clients";
import { repositoryTbl } from "@git-dash/db";

export const aggregateSelfRepo = async (
  octokit: Awaited<ReturnType<typeof getOctokit>>,
  sharedDbClient: ReturnType<typeof getDbClient>,
) => {
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  const repoFullName = process.env["GITHUB_REPOSITORY"];
  console.log(`repoFullName: ${repoFullName}`);

  if (!repoFullName) throw Error("GITHUB_REPOSITORY is not set");

  const [owner, repoName] = repoFullName.split("/");
  if (!owner || !repoName) throw Error("Invalid GITHUB_REPOSITORY");

  // ref: https://docs.github.com/ja/rest/repos/repos?apiVersion=2022-11-28
  const result = await octokit.rest.repos.get({
    owner,
    repo: repoName,
  });

  const repo = result.data;

  const now = new Date();
  await sharedDbClient
    .insert(repositoryTbl)
    .values({
      id: repo.id,
      name: repo.name,
      owner: repo.owner.login,
      createdAt: now,
      createdAtGithub: repo.created_at ? new Date(repo.created_at) : null,
      updatedAt: now,
      updatedAtGithub: repo.updated_at ? new Date(repo.updated_at) : null,
    })
    .onConflictDoUpdate({
      target: repositoryTbl.id,
      set: {
        name: repo.name,
        owner: repo.owner.login,
        createdAtGithub: repo.created_at ? new Date(repo.created_at) : null,
        updatedAt: now,
        updatedAtGithub: repo.updated_at ? new Date(repo.updated_at) : null,
      },
    });

  return [repo];
};

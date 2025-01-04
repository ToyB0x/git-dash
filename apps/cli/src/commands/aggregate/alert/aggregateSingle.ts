import type { getDbClient, getOctokit } from "@/clients";
import { logger } from "@/utils";
import { alertTbl, repositoryTbl } from "@git-dash/db";
import { eq } from "drizzle-orm";

export const aggregateSingle = async (
  scanId: number,
  sharedDbClient: ReturnType<typeof getDbClient>,
  octokit: Awaited<ReturnType<typeof getOctokit>>,
) => {
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  const repoFullName = process.env["GITHUB_REPOSITORY"];
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  const repoId = Number(process.env["GITHUB_REPOSITORY_ID"]);
  if (!repoFullName) throw Error("GITHUB_REPOSITORY is not set");

  const [owner, repoName] = repoFullName.split("/");
  if (!owner || !repoName || !repoId) throw Error("Invalid GITHUB_REPOSITORY");

  try {
    // ref: https://docs.github.com/ja/rest/repos/repos?apiVersion=2022-11-28#check-if-vulnerability-alerts-are-enabled-for-a-repository
    const isEnabledAlert = await octokit.rest.repos.checkVulnerabilityAlerts({
      owner,
      repo: repoName,
    });

    await sharedDbClient
      .update(repositoryTbl)
      .set({
        enabledAlert: isEnabledAlert.status === 204,
        enabledAlertCheckedAt: new Date(),
      })
      .where(eq(repositoryTbl.id, repoId));
  } catch (e) {
    // TODO: statusが404以外の場合のエラーハンドリングを追加
    await sharedDbClient
      .update(repositoryTbl)
      .set({
        enabledAlert: false,
        enabledAlertCheckedAt: new Date(),
      })
      .where(eq(repositoryTbl.id, repoId));

    logger.warn("this repository does not have vulnerability alerts enabled");
    return;
  }

  // ref: https://docs.github.com/ja/rest/dependabot/alerts?apiVersion=2022-11-28#list-dependabot-alerts-for-a-repository
  const alerts = await octokit.paginate(
    octokit.rest.dependabot.listAlertsForRepo,
    {
      owner,
      repo: repoName,
      state: "open",
      per_page: 100,
    },
  );

  const alertBySeverity: {
    [severity: string]: number;
  } = {};

  for (const alert of alerts) {
    if (
      alert.security_advisory.severity !== alert.security_vulnerability.severity
    ) {
      logger.warn(
        `severity mismatch: ${alert.security_advisory.severity} !== ${alert.security_vulnerability.severity}`,
      );
    }

    const isCountedSeverity =
      alertBySeverity[alert.security_vulnerability.severity];
    if (isCountedSeverity) {
      // @ts-ignore
      alertBySeverity[alert.security_vulnerability.severity] += 1;
    } else {
      alertBySeverity[alert.security_vulnerability.severity] = 1;
    }
  }

  const now = new Date();
  await sharedDbClient
    .insert(alertTbl)
    .values({
      scanId,
      // biome-ignore lint/complexity/useLiteralKeys: <explanation>
      countCritical: alertBySeverity?.["critical"] || 0,
      // biome-ignore lint/complexity/useLiteralKeys: <explanation>
      countHigh: alertBySeverity?.["high"] || 0,
      // biome-ignore lint/complexity/useLiteralKeys: <explanation>
      countMedium: alertBySeverity?.["medium"] || 0,
      // biome-ignore lint/complexity/useLiteralKeys: <explanation>
      countLow: alertBySeverity?.["low"] || 0,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      createdAt: now,
      updatedAt: now,
      repositoryId: repoId,
    })
    .onConflictDoUpdate({
      target: [
        alertTbl.repositoryId,
        alertTbl.year,
        alertTbl.month,
        alertTbl.day,
      ],
      set: {
        scanId,
        // biome-ignore lint/complexity/useLiteralKeys: <explanation>
        countCritical: alertBySeverity?.["critical"] || 0,
        // biome-ignore lint/complexity/useLiteralKeys: <explanation>
        countHigh: alertBySeverity?.["high"] || 0,
        // biome-ignore lint/complexity/useLiteralKeys: <explanation>
        countMedium: alertBySeverity?.["medium"] || 0,
        // biome-ignore lint/complexity/useLiteralKeys: <explanation>
        countLow: alertBySeverity?.["low"] || 0,
        updatedAt: now,
      },
    });
};

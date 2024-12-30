import { getOctokit, sharedDbClient } from "@/clients";
import { env } from "@/env";
import { logger } from "@/utils";
import { alertTbl, repositoryTbl } from "@repo/db-shared";
import { PromisePool } from "@supercharge/promise-pool";
import { eq, isNull, lt, or } from "drizzle-orm";

const maxOldRepositoryDate = new Date(
  Date.now() - 7 /* days */ * 1000 * 60 * 60 * 24,
);

export const aggregate = async () => {
  const octokit = await getOctokit();

  // NOTE: 直近に更新されていないリポジトリは除外して高速化する
  const repositories = await sharedDbClient
    .select()
    .from(repositoryTbl)
    .where(
      or(
        lt(repositoryTbl.enabledAlertCheckedAt, maxOldRepositoryDate),
        isNull(repositoryTbl.enabledAlertCheckedAt),
      ),
    );

  await PromisePool.for(repositories)
    // 8 concurrent requests
    // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
    .withConcurrency(8)
    .process(async (repository, i) => {
      logger.info(
        `Start aggregate:alert-status ${repository.name} (${i + 1}/${repositories.length})`,
      );

      try {
        // ref: https://docs.github.com/ja/rest/repos/repos?apiVersion=2022-11-28#check-if-vulnerability-alerts-are-enabled-for-a-repository
        const isEnabledAlert =
          await octokit.rest.repos.checkVulnerabilityAlerts({
            owner: env.GDASH_GITHUB_ORGANIZATION_NAME,
            repo: repository.name,
          });

        await sharedDbClient
          .update(repositoryTbl)
          .set({
            enabledAlert: isEnabledAlert.status === 204,
            enabledAlertCheckedAt: new Date(),
          })
          .where(eq(repositoryTbl.id, repository.id));
      } catch (e) {
        // TODO: statusが404以外の場合のエラーハンドリングを追加
        await sharedDbClient
          .update(repositoryTbl)
          .set({
            enabledAlert: false,
            enabledAlertCheckedAt: new Date(),
          })
          .where(eq(repositoryTbl.id, repository.id));
      }
    });

  // ref: https://docs.github.com/ja/rest/dependabot/alerts?apiVersion=2022-11-28
  const alerts = await octokit.paginate(
    octokit.rest.dependabot.listAlertsForOrg,
    {
      org: env.GDASH_GITHUB_ORGANIZATION_NAME,
      per_page: 100,
      state: "open",
    },
  );

  const alertByRepository: {
    [repoId: number]: {
      [severity: string]: number;
    };
  } = [];

  for (const alert of alerts) {
    if (
      alert.security_advisory.severity !== alert.security_vulnerability.severity
    ) {
      logger.warn(
        `severity mismatch: ${alert.security_advisory.severity} !== ${alert.security_vulnerability.severity}`,
      );
    }

    const existRepo = alertByRepository[alert.repository.id];
    if (existRepo) {
      const repoSeverity =
        alertByRepository[alert.repository.id]?.[
          alert.security_vulnerability.severity
        ];
      if (repoSeverity) {
        alertByRepository[alert.repository.id]![
          alert.security_vulnerability.severity
        ]! += 1;
      } else {
        alertByRepository[alert.repository.id]![
          alert.security_vulnerability.severity
        ] = 1;
      }
    } else {
      alertByRepository[alert.repository.id] = {
        [alert.security_vulnerability.severity]: 1,
      };
    }
  }

  const now = new Date();
  for (const [repoId, severities] of Object.entries(alertByRepository)) {
    for (const [severity, count] of Object.entries(severities)) {
      await sharedDbClient
        .insert(alertTbl)
        .values({
          count,
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          day: now.getDate(),
          severity: severity,
          createdAt: now,
          updatedAt: now,
          repositoryId: Number(repoId),
        })
        .onConflictDoUpdate({
          target: [
            alertTbl.repositoryId,
            alertTbl.year,
            alertTbl.month,
            alertTbl.day,
            alertTbl.severity,
          ],
          set: {
            count,
            updatedAt: now,
          },
        });
    }
  }
};

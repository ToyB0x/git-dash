/* NOTE:
 * WorkflowRunはたった1ヶ月分のデータ取得をするだけでも以下の課題があるため現在は無効化する
 * - たった1ヶ月のデータ取得でもGithub Action が 5000 回実行されていたとすると 5000 point 使う (注: 一度取得したActionは再取得しないように効率化すれば差分だけ見れば済むが実装・保守コストが大きい)
 * - WorkflowRunの個別の値を合計しても、Githubの課金サイクルの統計とズレが出てしまう(何らかの理由により3倍くらいズレるケースがある)
 * - 個々のWorkflowRunの個別の結果をDBに入れるとDB容量が膨大になるため、データの保持期間を短くしなければならない
 */

// import { getOctokit, sharedDbClient } from "@/clients";
// import { env } from "@/env";
// import { calcActionsCostFromTime, logger } from "@/utils";
// import { workflowRunTbl } from "@git-dash/db-shared";
// import { PromisePool } from "@supercharge/promise-pool";
// import { eq } from "drizzle-orm";
//
// // NOTE: 企業規模やリポジトリ数によってはかなりのQuotaを消費するため、注意が必要
// // ex. 1リポジトリあたり5Action * 100Runs/monthと仮定して、100リポジトリある場合は　5 * 100 * 100 = 5万回 PointsのQuotaが必要なため
// // 1日あたりに絞ってレポートを作成する
// export const aggregate = async (
//   repositories: { id: number; name: string }[],
// ) => {
//   const octokit = await getOctokit();
//
//   // eg: "2024-12-01";
//   const now = new Date();
//   const createdEnd = `${now.getFullYear()}-${
//     now.getMonth() + 1
//   }-${now.getDate().toString().padStart(2, "0")}`;
//
//   // eg: "2024-12-02";
//   const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
//   const createdStart = `${yesterday.getFullYear()}-${
//     yesterday.getMonth() + 1
//   }-${yesterday.getDate().toString().padStart(2, "0")}`;
//
//   const queryString = `${createdStart}..${createdEnd}`;
//
//   logger.warn(`fetching created: ${queryString}`);
//
//   // TODO: 直近に更新されていないリポジトリは除外して高速化する
//   await PromisePool.for(repositories)
//     // parent: 8 , child: 10 = max 80 concurrent requests
//     // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
//     .withConcurrency(8)
//     .process(async (repository, i) => {
//       logger.info(
//         `Start aggregate:workflow-run-and-each-run-cost:cost ${repository.name} (${i + 1}/${repositories.length})`,
//       );
//
//       // NOTE: リポジトリ数分だけリクエストを投げるため、リポジトリ数が多い場合はQuotaに注意(500リポジトリ * リポジトリあたり2回ページングした場合は 1000 Pointsも消費してしまう)
//       const workflowRuns = await octokit.paginate(
//         octokit.rest.actions.listWorkflowRunsForRepo,
//         {
//           owner: env.GDASH_GITHUB_ORGANIZATION_NAME,
//           repo: repository.name,
//           per_page: 1000,
//           created: `${queryString}`,
//           // status: "completed",
//           // TODO: 日を跨いで実行中でまだ終了していないActionの取得ができていないため要改善
//         },
//       );
//
//       await PromisePool.for(workflowRuns)
//         // parent: 8 , child: 10 = max 80 concurrent requests
//         // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
//         .withConcurrency(10)
//         .process(async (workflowRun) => {
//           const hasRecord = await sharedDbClient
//             .select()
//             .from(workflowRunTbl)
//             .where(eq(workflowRunTbl.id, workflowRun.id));
//
//           // TODO: 既にDBに登録されている2日前以上の利用量は、再度取得しないようにする(現在は２日前かどうかを見ていない)
//           if (hasRecord.length > 0) return;
//
//           const workflowUsage = await octokit.rest.actions.getWorkflowRunUsage({
//             owner: env.GDASH_GITHUB_ORGANIZATION_NAME,
//             repo: repository.name,
//             run_id: workflowRun.id,
//           });
//
//           logger.trace(
//             `remain quota ${workflowUsage.headers["x-ratelimit-remaining"]}`,
//           );
//
//           let dollar = 0;
//           for (const [runnerType, value] of Object.entries(
//             workflowUsage.data.billable,
//           )) {
//             if (!value.total_ms) continue;
//
//             const cost = calcActionsCostFromTime({
//               runner: runnerType,
//               milliSec: value.total_ms,
//             });
//
//             if (!cost || !cost.cost) continue;
//
//             dollar += cost.cost;
//           }
//
//           await sharedDbClient
//             .insert(workflowRunTbl)
//             .values({
//               id: workflowRun.id,
//               dollar: Math.round(dollar * 1000) / 1000, // 0.001 dollar
//               createdAt: new Date(workflowRun.created_at),
//               updatedAt: new Date(workflowRun.updated_at),
//               workflowId: workflowRun.workflow_id,
//             })
//             .onConflictDoUpdate({
//               target: workflowRunTbl.id,
//               set: {
//                 dollar: Math.round(dollar * 1000) / 1000, // 0.001 dollar
//                 updatedAt: new Date(),
//               },
//             });
//         });
//     });
// };

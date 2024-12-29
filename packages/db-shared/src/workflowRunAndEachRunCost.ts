/* NOTE:
 * WorkflowRunはたった1ヶ月分のデータ取得をするだけでも以下の課題があるため現在は無効化する
 * - たった1ヶ月のデータ取得でもGithub Action が 5000 回実行されていたとすると 5000 point 使う (注: 一度取得したActionは再取得しないように効率化すれば差分だけ見れば済むが実装・保守コストが大きい)
 * - WorkflowRunの個別の値を合計しても、Githubの課金サイクルの統計とズレが出てしまう(何らかの理由により3倍くらいズレるケースがある)
 * - 個々のWorkflowRunの個別の結果をDBに入れるとDB容量が膨大になるため、データの保持期間を短くしなければならない
 */

// import { int, sqliteTable } from "drizzle-orm/sqlite-core";
// import { workflowTbl } from "./workflow";
//
// export const workflowRunTbl = sqliteTable("workflow_run", {
//   id: int().primaryKey(), // github workflow run id
//   dollar: int().notNull(),
//   createdAt: int({ mode: "timestamp_ms" }).notNull(),
//   updatedAt: int({ mode: "timestamp_ms" }).notNull(), // finish time?
//   workflowId: int("workflow_id")
//     .notNull()
//     .references(() => workflowTbl.id, {
//       onUpdate: "cascade",
//       onDelete: "cascade",
//     }),
// });

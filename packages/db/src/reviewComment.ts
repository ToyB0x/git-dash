import { int, sqliteTable } from "drizzle-orm/sqlite-core";
import { repositoryTbl } from "./repository";

export const reviewCommentTbl = sqliteTable("reviewComment", {
  id: int().primaryKey(), // github review comment id
  createdAt: int({ mode: "timestamp_ms" }).notNull(),
  reviewerId: int("reviewer_id").notNull(), // 集計順序の都合でUserTblとのリレーションは持たない
  prId: int("pr_id").notNull(), // 集計順序を柔軟に変更できるようprTblとのリレーションは持たない(一定期間経過後、それぞれ独立してレコード削除するので問題ない)
  repositoryId: int("repository_id") // PRテーブルを経由してリポジトリ情報を取得するのが実務上不便なのでリレーションを追加
    .notNull()
    .references(() => repositoryTbl.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
  pullRequestReviewId: int("pull_request_review_id"),
  // .notNull() // pull_request_review_idがnullの場合があるためnotNullを外す
  // NOTE: 集計順序を柔軟に変更できるようprTblとのリレーションは持たない(一定期間経過後、それぞれ独立してレコード削除するので問題ない)
  // .references(() => reviewTbl.id, {onUpdate: "cascade",onDelete: "cascade",}),

  // NOTE: 実運用上scanIdではなく、createdAtでの集計を行うためリレーションは持たない
  // scanId: int()
  //   .notNull()
  //   .references(() => scanTbl.id, {
  //     onUpdate: "cascade",
  //     onDelete: "cascade",
  //   }),
});

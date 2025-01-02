import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { repositoryTbl } from "./repository";

// NOTE: PRブランチのコミットも以下で確認できる
// https://github.com/[org]/[repo]/commit/[hash]
export const prCommitTbl = sqliteTable("pr_commit", {
  id: text().primaryKey(), // github commit hash id
  prId: int("pr_id").notNull(), // 集計順序を柔軟に変更できるようリレーションは持たない(一定期間経過後、それぞれ独立してレコード削除するので問題ない)
  authorId: int("author_id").notNull(), // 集計順序の都合でUserTblとのリレーションは持たない
  commitAt: int("commit_at", { mode: "timestamp_ms" }).notNull(), // commit data
  repositoryId: int("repository_id") // PRテーブルを経由してリポジトリ情報を取得するのが実務上不便なのでリレーションを追加
    .notNull()
    .references(() => repositoryTbl.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
  // 実運用上scanIdではなく、createdAtでの集計を行うためリレーションは持たない
  // scanId: int()
  //   .notNull()
  //   .references(() => scanTbl.id, {
  //     onUpdate: "cascade",
  //     onDelete: "cascade",
  //   }),
});

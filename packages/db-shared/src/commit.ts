import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

// NOTE: PRブランチのコミットも以下で確認できる
// https://github.com/[org]/[repo]/commit/[hash]
export const commitTbl = sqliteTable("commit", {
  id: text().primaryKey(), // github commit hash id
  repositoryId: int("repository_id").notNull(), // 集計順序を柔軟に変更できるようリレーションは持たない(一定期間経過後、それぞれ独立してレコード削除するので問題ない)
  authorName: int("author_name").notNull(), // 集計順序の都合でUserTblとのリレーションは持たない
  createdAt: int({ mode: "timestamp_ms" }).notNull(), // commit data
});

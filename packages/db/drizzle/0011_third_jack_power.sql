CREATE TABLE `pr_commit` (
	`id` text PRIMARY KEY NOT NULL,
	`pr_id` integer NOT NULL,
	`author_id` integer NOT NULL,
	`commit_at` integer NOT NULL
);

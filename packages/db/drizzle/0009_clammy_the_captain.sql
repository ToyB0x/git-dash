CREATE TABLE `commit` (
	`id` text PRIMARY KEY NOT NULL,
	`repository_id` integer NOT NULL,
	`author_name` text NOT NULL,
	`createdAt` integer NOT NULL
);

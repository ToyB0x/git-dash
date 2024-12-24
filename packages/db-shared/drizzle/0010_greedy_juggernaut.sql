CREATE TABLE `review` (
	`id` integer PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`reviewer_id` integer NOT NULL,
	`pr_id` integer
);

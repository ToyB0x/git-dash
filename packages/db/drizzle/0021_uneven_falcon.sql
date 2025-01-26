CREATE TABLE `review` (
	`id` integer PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`pr_id` integer NOT NULL,
	`reviewer_id` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`repository_id` integer NOT NULL,
	FOREIGN KEY (`repository_id`) REFERENCES `repository`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `reviewComment` ADD `pull_request_review_id` integer;
CREATE TABLE `timeline` (
	`id` integer PRIMARY KEY NOT NULL,
	`pr_id` integer NOT NULL,
	`actor_id` integer NOT NULL,
	`event_type` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `repository` ADD `createdAtGithub` integer;--> statement-breakpoint
ALTER TABLE `repository` ADD `updatedAtGithub` integer;
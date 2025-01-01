CREATE TABLE `pr_commit` (
	`id` text PRIMARY KEY NOT NULL,
	`pr_id` integer NOT NULL,
	`author_id` integer NOT NULL,
	`commit_at` integer NOT NULL,
	`repository_id` integer NOT NULL,
	FOREIGN KEY (`repository_id`) REFERENCES `repository`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `review` (
	`id` integer PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`reviewer_id` integer NOT NULL,
	`pr_id` integer NOT NULL,
	`repository_id` integer NOT NULL,
	FOREIGN KEY (`repository_id`) REFERENCES `repository`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `timeline` (
	`id` integer PRIMARY KEY NOT NULL,
	`pr_id` integer NOT NULL,
	`actor_id` integer NOT NULL,
	`requested_reviewer_id` integer,
	`event_type` text NOT NULL,
	`createdAt` integer NOT NULL,
	`repository_id` integer NOT NULL,
	FOREIGN KEY (`repository_id`) REFERENCES `repository`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workflow_usage_current_cycle` (
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`day` integer NOT NULL,
	`workflow_id` integer NOT NULL,
	`dollar` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`scanId` integer NOT NULL,
	`repository_id` integer NOT NULL,
	PRIMARY KEY(`year`, `month`, `day`, `workflow_id`),
	FOREIGN KEY (`workflow_id`) REFERENCES `workflow`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`scanId`) REFERENCES `scan`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`repository_id`) REFERENCES `repository`(`id`) ON UPDATE cascade ON DELETE cascade
);

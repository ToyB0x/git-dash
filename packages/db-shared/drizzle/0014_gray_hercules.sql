CREATE TABLE `workflow_usage_current_cycle_org` (
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`day` integer NOT NULL,
	`dollar` integer NOT NULL,
	`runner_type` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	PRIMARY KEY(`year`, `month`, `day`)
);
--> statement-breakpoint
DROP TABLE `workflow_usage_current_cycle_by_runner`;
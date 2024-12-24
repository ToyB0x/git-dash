CREATE TABLE `workflow_usage_current_cycle_by_runner` (
	`runner_type` text PRIMARY KEY NOT NULL,
	`dollar` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
DROP TABLE `usage_current_cycle_action_org`;
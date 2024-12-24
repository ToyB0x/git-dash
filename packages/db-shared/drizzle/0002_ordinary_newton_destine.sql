CREATE TABLE `usage_current_cycle_action_repo` (
	`id` integer PRIMARY KEY NOT NULL,
	`cost` integer NOT NULL,
	`repo_name` text NOT NULL,
	`workflow_name` text NOT NULL,
	`workflow_path` text NOT NULL,
	`runner_type` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);

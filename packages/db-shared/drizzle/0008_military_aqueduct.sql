CREATE TABLE `workflow_usage_current_cycle` (
	`id` integer PRIMARY KEY NOT NULL,
	`dollar` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `workflow`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `usage_current_cycle_action_repo`;
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_usage_current_cycle_action_org` (
	`id` integer PRIMARY KEY NOT NULL,
	`cost` integer NOT NULL,
	`runner_type` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_usage_current_cycle_action_org`("id", "cost", "runner_type", "createdAt", "updatedAt") SELECT "id", "cost", "runner_type", "createdAt", "updatedAt" FROM `usage_current_cycle_action_org`;--> statement-breakpoint
DROP TABLE `usage_current_cycle_action_org`;--> statement-breakpoint
ALTER TABLE `__new_usage_current_cycle_action_org` RENAME TO `usage_current_cycle_action_org`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
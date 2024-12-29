PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workflow_usage_current_cycle_org` (
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`day` integer NOT NULL,
	`dollar` integer NOT NULL,
	`runner_type` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	PRIMARY KEY(`year`, `month`, `day`, `runner_type`)
);
--> statement-breakpoint
INSERT INTO `__new_workflow_usage_current_cycle_org`("year", "month", "day", "dollar", "runner_type", "createdAt", "updatedAt") SELECT "year", "month", "day", "dollar", "runner_type", "createdAt", "updatedAt" FROM `workflow_usage_current_cycle_org`;--> statement-breakpoint
DROP TABLE `workflow_usage_current_cycle_org`;--> statement-breakpoint
ALTER TABLE `__new_workflow_usage_current_cycle_org` RENAME TO `workflow_usage_current_cycle_org`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
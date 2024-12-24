PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workflow_run` (
	`id` integer PRIMARY KEY NOT NULL,
	`dollar` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`workflow_name` integer NOT NULL,
	FOREIGN KEY (`workflow_name`) REFERENCES `workflow`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_workflow_run`("id", "dollar", "createdAt", "updatedAt", "workflow_name") SELECT "id", "dollar", "createdAt", "updatedAt", "workflow_name" FROM `workflow_run`;--> statement-breakpoint
DROP TABLE `workflow_run`;--> statement-breakpoint
ALTER TABLE `__new_workflow_run` RENAME TO `workflow_run`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
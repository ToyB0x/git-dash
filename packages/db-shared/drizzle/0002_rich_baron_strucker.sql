CREATE TABLE `pr` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`number` integer NOT NULL,
	`state` text NOT NULL,
	`additions` integer NOT NULL,
	`deletions` integer NOT NULL,
	`changed_files` integer NOT NULL,
	`merged_at` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`author_id` integer NOT NULL,
	`repository_id` integer NOT NULL,
	FOREIGN KEY (`repository_id`) REFERENCES `repository`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workflow` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`path` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`repository_id` integer NOT NULL,
	FOREIGN KEY (`repository_id`) REFERENCES `repository`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_workflow`("id", "name", "path", "createdAt", "updatedAt", "repository_id") SELECT "id", "name", "path", "createdAt", "updatedAt", "repositoryId" FROM `workflow`;--> statement-breakpoint
DROP TABLE `workflow`;--> statement-breakpoint
ALTER TABLE `__new_workflow` RENAME TO `workflow`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
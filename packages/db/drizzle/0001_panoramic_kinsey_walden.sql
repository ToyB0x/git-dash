PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pr` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text,
	`number` integer NOT NULL,
	`merged_at` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`author_id` integer NOT NULL,
	`repository_id` integer NOT NULL,
	FOREIGN KEY (`repository_id`) REFERENCES `repository`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_pr`("id", "title", "number", "merged_at", "createdAt", "updatedAt", "author_id", "repository_id") SELECT "id", "title", "number", "merged_at", "createdAt", "updatedAt", "author_id", "repository_id" FROM `pr`;--> statement-breakpoint
DROP TABLE `pr`;--> statement-breakpoint
ALTER TABLE `__new_pr` RENAME TO `pr`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
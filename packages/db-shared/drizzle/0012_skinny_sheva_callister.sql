PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_release` (
	`id` integer PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`author_id` integer NOT NULL,
	`name` text,
	`body` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`publishedAt` integer,
	`repository_id` integer NOT NULL,
	FOREIGN KEY (`repository_id`) REFERENCES `repository`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_release`("id", "url", "author_id", "name", "body", "createdAt", "updatedAt", "publishedAt", "repository_id") SELECT "id", "url", "author_id", "name", "body", "createdAt", "updatedAt", "publishedAt", "repository_id" FROM `release`;--> statement-breakpoint
DROP TABLE `release`;--> statement-breakpoint
ALTER TABLE `__new_release` RENAME TO `release`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
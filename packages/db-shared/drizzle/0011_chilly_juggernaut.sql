CREATE TABLE `release` (
	`id` integer PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`author_id` integer NOT NULL,
	`name` text,
	`body` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`publishedAt` integer,
	`repository_id` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`repository_id`) REFERENCES `repository`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_review` (
	`id` integer PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`reviewer_id` integer NOT NULL,
	`pr_id` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_review`("id", "createdAt", "reviewer_id", "pr_id") SELECT "id", "createdAt", "reviewer_id", "pr_id" FROM `review`;--> statement-breakpoint
DROP TABLE `review`;--> statement-breakpoint
ALTER TABLE `__new_review` RENAME TO `review`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
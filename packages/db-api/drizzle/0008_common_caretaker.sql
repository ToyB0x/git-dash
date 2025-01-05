PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users_to_workspaces` (
	`user_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`role` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	PRIMARY KEY(`user_id`, `workspace_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_users_to_workspaces`("user_id", "workspace_id", "role", "createdAt", "updatedAt") SELECT "user_id", "workspace_id", "role", "createdAt", "updatedAt" FROM `users_to_workspaces`;--> statement-breakpoint
DROP TABLE `users_to_workspaces`;--> statement-breakpoint
ALTER TABLE `__new_users_to_workspaces` RENAME TO `users_to_workspaces`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
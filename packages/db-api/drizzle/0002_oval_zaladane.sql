PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workspace` (
	`id` text(8) PRIMARY KEY NOT NULL,
	`displayName` text(24) NOT NULL,
	`api_token` text(32),
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_workspace`("id", "displayName", "api_token", "createdAt", "updatedAt") SELECT "id", "displayName", "api_token", "createdAt", "updatedAt" FROM `workspace`;--> statement-breakpoint
DROP TABLE `workspace`;--> statement-breakpoint
ALTER TABLE `__new_workspace` RENAME TO `workspace`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
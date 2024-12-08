PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_report` (
	`id` text(12) PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_report`("id", "status", "createdAt", "updatedAt") SELECT "id", "status", "createdAt", "updatedAt" FROM `report`;--> statement-breakpoint
DROP TABLE `report`;--> statement-breakpoint
ALTER TABLE `__new_report` RENAME TO `report`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text(8) PRIMARY KEY NOT NULL,
	`email` text(256) NOT NULL,
	`firebase_uid` text(36) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "email", "firebase_uid", "createdAt", "updatedAt") SELECT "id", "email", "firebase_uid", "createdAt", "updatedAt" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
CREATE UNIQUE INDEX `uq_user_firebase_uid` ON `user` (`firebase_uid`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_user_lower_email` ON `user` (`lower("email")`);
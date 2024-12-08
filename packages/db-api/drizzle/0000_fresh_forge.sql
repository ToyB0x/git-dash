CREATE TABLE `group` (
	`id` integer PRIMARY KEY NOT NULL,
	`public_id` text(8) NOT NULL,
	`displayName` text(24) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_group_public_id` ON `group` (`public_id`);--> statement-breakpoint
CREATE TABLE `report` (
	`id` integer PRIMARY KEY NOT NULL,
	`public_id` text(12) NOT NULL,
	`status` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_report_public_id` ON `report` (`public_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`public_id` text(8) NOT NULL,
	`email` text(256) NOT NULL,
	`firebase_uid` text(36) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_user_public_id` ON `user` (`public_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_user_firebase_uid` ON `user` (`firebase_uid`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_user_lower_email` ON `user` (lower("email"));--> statement-breakpoint
CREATE TABLE `users_to_groups` (
	`user_id` integer NOT NULL,
	`group_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `group_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON UPDATE no action ON DELETE no action
);

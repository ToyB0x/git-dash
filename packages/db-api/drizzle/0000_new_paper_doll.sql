CREATE TABLE `workspace` (
	`id` text(8) PRIMARY KEY NOT NULL,
	`displayName` text(24) NOT NULL,
	`api_token` text(32) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `report` (
	`id` text(12) PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`workspace_id` text NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_report_workspace_id` ON `report` (`workspace_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text(8) PRIMARY KEY NOT NULL,
	`email` text(256) NOT NULL,
	`firebase_uid` text(36) NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_user_firebase_uid` ON `user` (`firebase_uid`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_user_lower_email` ON `user` (lower("email"));--> statement-breakpoint
CREATE TABLE `users_to_workspaces` (
	`user_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`role` text NOT NULL,
	PRIMARY KEY(`user_id`, `workspace_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE cascade ON DELETE cascade
);

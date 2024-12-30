CREATE TABLE `alert` (
	`count` integer NOT NULL,
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`day` integer NOT NULL,
	`severity` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`repository_id` integer NOT NULL,
	PRIMARY KEY(`repository_id`, `year`, `month`, `day`, `severity`),
	FOREIGN KEY (`repository_id`) REFERENCES `repository`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `repository` ADD `enabled_alert` integer;--> statement-breakpoint
ALTER TABLE `repository` ADD `enabled_alert_checked_at` integer;
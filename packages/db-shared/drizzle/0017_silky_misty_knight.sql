CREATE TABLE `alert` (
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`day` integer NOT NULL,
	`count_critical` integer NOT NULL,
	`count_high` integer NOT NULL,
	`count_medium` integer NOT NULL,
	`count_low` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`repository_id` integer NOT NULL,
	`scanId` integer NOT NULL,
	PRIMARY KEY(`repository_id`, `year`, `month`, `day`),
	FOREIGN KEY (`repository_id`) REFERENCES `repository`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`scanId`) REFERENCES `scan`(`id`) ON UPDATE cascade ON DELETE cascade
);

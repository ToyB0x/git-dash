CREATE TABLE `workflow_usage_current_cycle` (
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`day` integer NOT NULL,
	`workflow_id` integer NOT NULL,
	`dollar` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`scanId` integer NOT NULL,
	PRIMARY KEY(`year`, `month`, `day`, `workflow_id`),
	FOREIGN KEY (`workflow_id`) REFERENCES `workflow`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`scanId`) REFERENCES `scan`(`id`) ON UPDATE cascade ON DELETE cascade
);

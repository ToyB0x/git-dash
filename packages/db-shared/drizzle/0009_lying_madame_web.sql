CREATE TABLE `workflow_run` (
	`id` integer PRIMARY KEY NOT NULL,
	`dollar` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`workflow_name` text NOT NULL,
	FOREIGN KEY (`workflow_name`) REFERENCES `workflow`(`id`) ON UPDATE cascade ON DELETE cascade
);

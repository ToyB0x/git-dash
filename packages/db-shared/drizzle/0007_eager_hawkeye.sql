CREATE TABLE `workflow` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`path` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`repositoryId` integer NOT NULL,
	FOREIGN KEY (`repositoryId`) REFERENCES `repository`(`id`) ON UPDATE cascade ON DELETE cascade
);

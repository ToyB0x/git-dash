CREATE TABLE `billing_cycle` (
	`scanId` integer PRIMARY KEY NOT NULL,
	`days_left` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`scanId`) REFERENCES `scan`(`id`) ON UPDATE cascade ON DELETE cascade
);

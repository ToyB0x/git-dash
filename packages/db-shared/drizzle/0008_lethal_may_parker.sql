CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`login` text NOT NULL,
	`name` text NOT NULL,
	`blog` text,
	`avatar_url` text,
	`updatedAt` integer NOT NULL
);

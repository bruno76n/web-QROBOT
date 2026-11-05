CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `categories_position_idx` ON `categories` (`position`);
--> statement-breakpoint
INSERT INTO `categories` (`id`, `label`, `position`) VALUES
	('negocio', 'Para tu negocio', 0),
	('casa', 'Para la casa', 1),
	('navidad', 'Navidad', 2);

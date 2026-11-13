CREATE TABLE `learn_datasets` (
	`key` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `learn_faqs` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`position` integer NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `learn_pages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `learn_faqs_page_idx` ON `learn_faqs` (`page_id`,`position`);--> statement-breakpoint
CREATE TABLE `learn_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`kind` text NOT NULL,
	`topic` text DEFAULT '' NOT NULL,
	`title` text NOT NULL,
	`subtitle` text DEFAULT '' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`body_md` text DEFAULT '' NOT NULL,
	`body_ast` text DEFAULT '[]' NOT NULL,
	`toc` text DEFAULT '[]' NOT NULL,
	`search_text` text DEFAULT '' NOT NULL,
	`filters` text DEFAULT '[]' NOT NULL,
	`chips` text DEFAULT '[]' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`related` text DEFAULT '[]' NOT NULL,
	`sources` text DEFAULT '[]' NOT NULL,
	`extra` text DEFAULT '{}' NOT NULL,
	`audience` text DEFAULT 'all' NOT NULL,
	`cta` text DEFAULT 'whatsapp' NOT NULL,
	`cta_text` text DEFAULT '' NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`reviewed` text DEFAULT '' NOT NULL,
	`edited_in_panel` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learn_pages_slug_unique` ON `learn_pages` (`slug`);--> statement-breakpoint
CREATE INDEX `learn_pages_topic_idx` ON `learn_pages` (`topic`,`published`,`sort_order`);--> statement-breakpoint
CREATE TABLE `learn_search_misses` (
	`day` text NOT NULL,
	`query` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `query`)
);
--> statement-breakpoint
CREATE INDEX `learn_search_misses_day_idx` ON `learn_search_misses` (`day`);--> statement-breakpoint
CREATE TABLE `learn_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text
);

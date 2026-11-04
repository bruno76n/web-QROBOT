CREATE TABLE `hero_slides` (
	`id` text PRIMARY KEY NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`desktop_photo_id` text NOT NULL,
	`mobile_photo_id` text,
	FOREIGN KEY (`desktop_photo_id`) REFERENCES `photos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`mobile_photo_id`) REFERENCES `photos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_type` text NOT NULL,
	`owner_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`original_key` text NOT NULL,
	`original_width` integer NOT NULL,
	`original_height` integer NOT NULL,
	`crop_x` integer NOT NULL,
	`crop_y` integer NOT NULL,
	`crop_width` integer NOT NULL,
	`crop_height` integer NOT NULL,
	`aspect` text NOT NULL,
	`version` text NOT NULL,
	`widths` text DEFAULT '[]' NOT NULL,
	`alt` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `photos_owner_idx` ON `photos` (`owner_type`,`owner_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `photos_status_created_idx` ON `photos` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `product_categories` (
	`product_id` text NOT NULL,
	`category` text NOT NULL,
	PRIMARY KEY(`product_id`, `category`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_categories_category_idx` ON `product_categories` (`category`,`product_id`);--> statement-breakpoint
CREATE TABLE `product_colors` (
	`product_id` text NOT NULL,
	`color` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`product_id`, `color`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`unit_singular` text DEFAULT '' NOT NULL,
	`unit_plural` text DEFAULT '' NOT NULL,
	`short` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`price_from_cents` integer,
	`price_note` text DEFAULT 'Baja si pides varias.' NOT NULL,
	`size` text DEFAULT '' NOT NULL,
	`material` text DEFAULT 'PLA' NOT NULL,
	`lead_time` text DEFAULT '' NOT NULL,
	`personalizable` integer DEFAULT false NOT NULL,
	`personal_hint` text DEFAULT '' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `products_published_sort_idx` ON `products` (`published`,`sort_order`);
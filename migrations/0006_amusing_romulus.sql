CREATE TABLE `product_slugs` (
	`slug` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_slugs_product_idx` ON `product_slugs` (`product_id`);
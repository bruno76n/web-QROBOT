CREATE TABLE `whatsapp_clicks` (
	`day` text NOT NULL,
	`source` text NOT NULL,
	`product_id` text DEFAULT '' NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `source`, `product_id`)
);

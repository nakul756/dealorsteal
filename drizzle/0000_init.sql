CREATE TABLE `favourites` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`listing_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `favourites_user_listing` ON `favourites` (`user_id`,`listing_id`);--> statement-breakpoint
CREATE TABLE `offers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`listing_id` text NOT NULL,
	`amount` integer NOT NULL,
	`message` text,
	`status` text DEFAULT 'submitted' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `offers_user` ON `offers` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`phone` text,
	`image` text,
	`provider` text DEFAULT 'credentials' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `viewings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`listing_id` text NOT NULL,
	`slot` text NOT NULL,
	`note` text,
	`status` text DEFAULT 'requested' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `viewings_user` ON `viewings` (`user_id`);
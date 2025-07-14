PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_dogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`breed` text,
	`post_url` text NOT NULL,
	`image_url` text NOT NULL,
	`description` text NOT NULL,
	`scraped_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_dogs`("id", "name", "breed", "post_url", "image_url", "description", "scraped_at", "created_at", "updated_at") SELECT "id", "name", "breed", "post_url", "image_url", "description", "scraped_at", "created_at", "updated_at" FROM `dogs`;--> statement-breakpoint
DROP TABLE `dogs`;--> statement-breakpoint
ALTER TABLE `__new_dogs` RENAME TO `dogs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
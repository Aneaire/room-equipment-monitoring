CREATE TABLE `alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`lab_id` text,
	`severity` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`resolved` integer DEFAULT false,
	`resolved_by` text,
	`resolved_at` integer,
	`data` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`lab_id`) REFERENCES `laboratories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `attendance_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lab_id` text NOT NULL,
	`check_in_time` integer NOT NULL,
	`check_out_time` integer,
	`verification_method` text NOT NULL,
	`biometric_data` text,
	`ip_address` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lab_id`) REFERENCES `laboratories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `equipment` (
	`id` text PRIMARY KEY NOT NULL,
	`lab_id` text NOT NULL,
	`type` text NOT NULL,
	`serial_number` text,
	`brand` text,
	`model` text,
	`status` text DEFAULT 'present',
	`last_detected` integer,
	`position_x` real,
	`position_y` real,
	`assigned_station` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`lab_id`) REFERENCES `laboratories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `laboratories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`building` text NOT NULL,
	`room_number` text NOT NULL,
	`capacity` integer NOT NULL,
	`status` text DEFAULT 'active',
	`description` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`read` integer DEFAULT false,
	`data` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `occupancy_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`lab_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`people_count` integer NOT NULL,
	`detection_confidence` real,
	`snapshot_url` text,
	`camera_id` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`lab_id`) REFERENCES `laboratories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`lab_id` text NOT NULL,
	`user_id` text NOT NULL,
	`day_of_week` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`course_code` text,
	`section` text,
	`subject` text,
	`is_recurring` integer DEFAULT true,
	`start_date` integer,
	`end_date` integer,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`lab_id`) REFERENCES `laboratories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`type` text DEFAULT 'string',
	`description` text,
	`category` text,
	`updated_by` text,
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);--> statement-breakpoint
CREATE TABLE `system_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`entity_type` text,
	`entity_id` text,
	`details` text,
	`ip_address` text,
	`user_agent` text,
	`timestamp` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`full_name` text NOT NULL,
	`department` text,
	`biometric_id` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
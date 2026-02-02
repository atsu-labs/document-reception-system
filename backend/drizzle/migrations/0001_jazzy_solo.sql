CREATE TABLE `inspections` (
	`id` text PRIMARY KEY NOT NULL,
	`notification_id` text NOT NULL,
	`inspection_date` text NOT NULL,
	`inspection_department_id` text NOT NULL,
	`inspection_type` text,
	`status` text DEFAULT '予定' NOT NULL,
	`result` text,
	`notes` text,
	`inspected_by` text,
	`inspected_at` text,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_by` text NOT NULL,
	FOREIGN KEY (`notification_id`) REFERENCES `notifications`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inspection_department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inspected_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE notification_types ADD `parent_group_id` text;--> statement-breakpoint
ALTER TABLE notification_types ADD `requires_additional_data` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE notifications ADD `additional_data` text;
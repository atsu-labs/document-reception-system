-- Step 1: notification_groupsテーブルを作成
CREATE TABLE `notification_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notification_groups_code_unique` ON `notification_groups` (`code`);
--> statement-breakpoint

-- Step 2: 既存のグループデータ（parent_group_id=NULLの届出種別）をnotification_groupsに移行
INSERT INTO notification_groups (id, code, name, description, is_active, sort_order, created_at, updated_at)
SELECT id, code, name, description, is_active, sort_order, created_at, updated_at
FROM notification_types
WHERE parent_group_id IS NULL;
--> statement-breakpoint

-- Step 3: notification_typesテーブルを再構築（SQLiteではカラム制約の変更にテーブル再作成が必要）
-- 3-1: 一時テーブルを作成
CREATE TABLE `notification_types_new` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`group_id` text NOT NULL,
	`has_inspection` integer DEFAULT false NOT NULL,
	`has_content_field` integer DEFAULT false NOT NULL,
	`requires_additional_data` integer DEFAULT false NOT NULL,
	`workflow_template_id` text,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (workflow_template_id) REFERENCES workflow_templates(id),
	FOREIGN KEY (group_id) REFERENCES notification_groups(id)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notification_types_new_code_unique` ON `notification_types_new` (`code`);
--> statement-breakpoint

-- 3-2: 子届出種別（parent_group_id != NULL）のデータを新テーブルにコピー
INSERT INTO notification_types_new (id, code, name, description, group_id, has_inspection, has_content_field, requires_additional_data, workflow_template_id, is_active, sort_order, created_at, updated_at)
SELECT id, code, name, description, parent_group_id, has_inspection, has_content_field, requires_additional_data, workflow_template_id, is_active, sort_order, created_at, updated_at
FROM notification_types
WHERE parent_group_id IS NOT NULL;
--> statement-breakpoint

-- 3-3: 古いテーブルを削除し、新しいテーブルをリネーム
DROP TABLE notification_types;
--> statement-breakpoint
ALTER TABLE notification_types_new RENAME TO notification_types;
--> statement-breakpoint
CREATE UNIQUE INDEX `notification_types_code_unique` ON `notification_types` (`code`);
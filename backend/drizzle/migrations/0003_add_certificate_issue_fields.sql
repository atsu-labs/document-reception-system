-- 証明書発行機能の追加とスキーマクリーンアップ

-- Step 1: notification_typesテーブルに証明書発行の有無フィールドを追加
ALTER TABLE notification_types ADD COLUMN `has_certificate_issue` integer DEFAULT false NOT NULL;
--> statement-breakpoint

-- Step 2: notificationsテーブルに証明書発行関連フィールドを追加
ALTER TABLE notifications ADD COLUMN `certificate_issue_department_id` text REFERENCES departments(id);
--> statement-breakpoint
ALTER TABLE notifications ADD COLUMN `certificate_issue_date` text;
--> statement-breakpoint

-- Step 3: notificationsテーブルから非推奨フィールドを削除（inspectionsテーブルに移行済み）
-- SQLiteではカラム削除にテーブル再作成が必要
CREATE TABLE `notifications_new` (
	`id` text PRIMARY KEY NOT NULL,
	`notification_type_id` text NOT NULL,
	`notification_date` text NOT NULL,
	`receiving_department_id` text NOT NULL,
	`processing_department_id` text NOT NULL,
	`property_name` text,
	`content` text,
	`additional_data` text,
	`certificate_issue_department_id` text,
	`certificate_issue_date` text,
	`completion_date` text,
	`current_status` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_by` text NOT NULL,
	FOREIGN KEY (notification_type_id) REFERENCES notification_types(id),
	FOREIGN KEY (receiving_department_id) REFERENCES departments(id),
	FOREIGN KEY (processing_department_id) REFERENCES departments(id),
	FOREIGN KEY (certificate_issue_department_id) REFERENCES departments(id),
	FOREIGN KEY (created_by) REFERENCES users(id),
	FOREIGN KEY (updated_by) REFERENCES users(id)
);
--> statement-breakpoint

-- 既存データを新テーブルにコピー（inspection_date と inspection_department_id を除外）
INSERT INTO notifications_new (
	id, notification_type_id, notification_date,
	receiving_department_id, processing_department_id,
	property_name, content, additional_data,
	completion_date, current_status,
	created_by, created_at, updated_at, updated_by
)
SELECT
	id, notification_type_id, notification_date,
	receiving_department_id, processing_department_id,
	property_name, content, additional_data,
	completion_date, current_status,
	created_by, created_at, updated_at, updated_by
FROM notifications;
--> statement-breakpoint

-- 古いテーブルを削除
DROP TABLE notifications;
--> statement-breakpoint

-- 新しいテーブルをリネーム
ALTER TABLE notifications_new RENAME TO notifications;

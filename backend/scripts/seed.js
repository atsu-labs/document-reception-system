#!/usr/bin/env node
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, unlinkSync } from 'fs';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get database path from environment or use default
const dbPath = process.env.DATABASE_PATH || join(__dirname, '..', 'local.db');

console.log('🌱 Seeding database...');
console.log(`📁 Database path: ${dbPath}`);

// Helper function to generate IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Hash password for users
const hashPassword = (password) => bcrypt.hashSync(password, 10);

// Escape single quotes for SQL
const escape = (str) => str ? str.replace(/'/g, "''") : str;

// Generate IDs
const dept1Id = generateId();
const dept2Id = generateId();
const dept3Id = generateId();
const dept4Id = generateId();
const workflow1Id = generateId();
const workflow2Id = generateId();
const adminUserId = generateId();
const seniorUserId = generateId();
const generalUserId = generateId();
const notifType1Id = generateId();
const notifType2Id = generateId();
const notifType3Id = generateId();
const notif1Id = generateId();
const notif2Id = generateId();
const history1Id = generateId();
const history2Id = generateId();

const seedSQL = `
-- Insert Departments
INSERT INTO departments (id, code, name, parent_id, is_active, sort_order)
VALUES 
  ('${dept1Id}', 'DEPT001', '総務部', NULL, 1, 1),
  ('${dept2Id}', 'DEPT002', '人事部', NULL, 1, 2),
  ('${dept3Id}', 'DEPT003', '経理部', NULL, 1, 3),
  ('${dept4Id}', 'DEPT004', '営業部', NULL, 1, 4);

-- Insert Workflow Templates
INSERT INTO workflow_templates (id, name, statuses)
VALUES 
  ('${workflow1Id}', '標準ワークフロー', '["受付","処理中","検査待ち","検査完了","完了"]'),
  ('${workflow2Id}', '簡易ワークフロー', '["受付","処理中","完了"]');

-- Insert Users
INSERT INTO users (id, username, password_hash, display_name, role, department_id, is_active)
VALUES 
  ('${adminUserId}', 'admin', '${escape(hashPassword('admin123'))}', '管理者ユーザー', 'ADMIN', '${dept1Id}', 1),
  ('${seniorUserId}', 'senior', '${escape(hashPassword('senior123'))}', '上級ユーザー', 'SENIOR', '${dept2Id}', 1),
  ('${generalUserId}', 'general', '${escape(hashPassword('general123'))}', '一般ユーザー', 'GENERAL', '${dept3Id}', 1);

-- Insert Notification Types
INSERT INTO notification_types (id, code, name, description, has_inspection, has_content_field, workflow_template_id, is_active, sort_order)
VALUES 
  ('${notifType1Id}', 'TYPE001', '休暇申請', '年次有給休暇、特別休暇等の申請', 1, 1, '${workflow1Id}', 1, 1),
  ('${notifType2Id}', 'TYPE002', '経費精算', '出張費、交通費等の経費精算', 1, 1, '${workflow1Id}', 1, 2),
  ('${notifType3Id}', 'TYPE003', '物品購入申請', '備品、消耗品等の購入申請', 0, 1, '${workflow2Id}', 1, 3);

-- Insert Notifications
INSERT INTO notifications (id, notification_type_id, notification_date, receiving_department_id, processing_department_id, property_name, content, inspection_date, inspection_department_id, completion_date, current_status, created_by, updated_by)
VALUES 
  ('${notif1Id}', '${notifType1Id}', '2025-01-15', '${dept2Id}', '${dept1Id}', '佐藤太郎', '年次有給休暇申請（1/20-1/22）', '2025-01-16', '${dept1Id}', NULL, '検査中', '${generalUserId}', '${generalUserId}'),
  ('${notif2Id}', '${notifType2Id}', '2025-01-18', '${dept3Id}', '${dept3Id}', '鈴木花子', '東京出張経費精算（交通費: ¥12,000）', NULL, NULL, NULL, '受付', '${generalUserId}', '${generalUserId}');

-- Insert Notification History
INSERT INTO notification_history (id, notification_id, status_from, status_to, changed_by, comment)
VALUES 
  ('${history1Id}', '${notif1Id}', '受付', '処理中', '${seniorUserId}', '処理を開始しました'),
  ('${history2Id}', '${notif1Id}', '処理中', '検査中', '${seniorUserId}', '検査に送付しました');
`;

try {
  // Write SQL to temporary file
  const tempFile = join(__dirname, 'temp_seed.sql');
  writeFileSync(tempFile, seedSQL);

  // Execute SQL
  execSync(`sqlite3 "${dbPath}" < "${tempFile}"`, { stdio: 'inherit' });

  // Clean up temp file
  unlinkSync(tempFile);

  console.log('\n🎉 Seed data inserted successfully!');
  console.log('\n📊 Summary:');
  console.log('  - 4 Departments');
  console.log('  - 2 Workflow Templates');
  console.log('  - 3 Users (admin/admin123, senior/senior123, general/general123)');
  console.log('  - 3 Notification Types');
  console.log('  - 2 Notifications');
  console.log('  - 2 History Records');
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
}

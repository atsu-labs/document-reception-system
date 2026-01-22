#!/usr/bin/env node
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get database path from environment or use default
const dbPath = process.env.DATABASE_PATH || join(__dirname, '..', 'local.db');

console.log('🔍 Verifying database...');
console.log(`📁 Database path: ${dbPath}`);

const runQuery = (query, description) => {
  try {
    const result = execSync(`sqlite3 "${dbPath}" "${query}"`, { encoding: 'utf-8' });
    return result.trim();
  } catch (error) {
    console.error(`❌ Query failed: ${description}`);
    console.error(error.message);
    return null;
  }
};

try {
  console.log('\n=== Database Verification ===\n');

  // 1. Count records in each table
  console.log('📊 Record counts:');
  const tables = ['departments', 'users', 'workflow_templates', 'notification_types', 'notifications', 'notification_history'];
  for (const table of tables) {
    const count = runQuery(`SELECT COUNT(*) FROM ${table};`, `Count ${table}`);
    console.log(`  ${table}: ${count}`);
  }

  // 2. List all departments
  console.log('\n📂 All Departments:');
  const departments = runQuery(
    `SELECT code, name, is_active FROM departments ORDER BY sort_order;`,
    'List departments'
  );
  if (departments) {
    departments.split('\n').forEach(line => {
      const [code, name, isActive] = line.split('|');
      console.log(`  - [${code}] ${name} (Active: ${isActive === '1' ? 'Yes' : 'No'})`);
    });
  }

  // 3. List all users with their departments
  console.log('\n👥 All Users:');
  const users = runQuery(
    `SELECT u.username, u.display_name, u.role, d.name 
     FROM users u 
     LEFT JOIN departments d ON u.department_id = d.id;`,
    'List users'
  );
  if (users) {
    users.split('\n').forEach(line => {
      const [username, displayName, role, deptName] = line.split('|');
      console.log(`  - ${username} (${displayName}) - ${role} - ${deptName || 'No Department'}`);
    });
  }

  // 4. List notification types
  console.log('\n📝 Notification Types:');
  const notifTypes = runQuery(
    `SELECT code, name, has_inspection, has_content_field FROM notification_types ORDER BY sort_order;`,
    'List notification types'
  );
  if (notifTypes) {
    notifTypes.split('\n').forEach(line => {
      const [code, name, hasInspection, hasContentField] = line.split('|');
      console.log(`  - [${code}] ${name}`);
      console.log(`    Inspection: ${hasInspection === '1' ? 'Yes' : 'No'}, Content Field: ${hasContentField === '1' ? 'Yes' : 'No'}`);
    });
  }

  // 5. List all notifications with details
  console.log('\n📬 All Notifications:');
  const notifications = runQuery(
    `SELECT n.notification_date, nt.name, n.property_name, n.content, n.current_status, d.name
     FROM notifications n
     LEFT JOIN notification_types nt ON n.notification_type_id = nt.id
     LEFT JOIN departments d ON n.receiving_department_id = d.id
     ORDER BY n.notification_date DESC;`,
    'List notifications'
  );
  if (notifications) {
    notifications.split('\n').forEach(line => {
      const [date, typeName, propertyName, content, status, deptName] = line.split('|');
      console.log(`\n  Date: ${date}`);
      console.log(`  Type: ${typeName || 'N/A'}`);
      console.log(`  Property: ${propertyName || 'N/A'}`);
      console.log(`  Content: ${content || 'N/A'}`);
      console.log(`  Status: ${status}`);
      console.log(`  Receiving Dept: ${deptName || 'N/A'}`);
    });
  }

  // 6. List notification history
  console.log('\n📊 Notification History:');
  const history = runQuery(
    `SELECT nh.status_from, nh.status_to, u.display_name, nh.comment, nh.changed_at
     FROM notification_history nh
     LEFT JOIN users u ON nh.changed_by = u.id
     ORDER BY nh.changed_at DESC;`,
    'List notification history'
  );
  if (history) {
    history.split('\n').forEach(line => {
      const [statusFrom, statusTo, changedBy, comment, changedAt] = line.split('|');
      console.log(`\n  ${statusFrom || 'Initial'} → ${statusTo}`);
      console.log(`  Changed by: ${changedBy}`);
      console.log(`  Comment: ${comment || 'N/A'}`);
      console.log(`  Date: ${changedAt}`);
    });
  }

  // 7. Test complex query - notifications by status
  console.log('\n📈 Notifications by Status:');
  const statusCounts = runQuery(
    `SELECT current_status, COUNT(*) FROM notifications GROUP BY current_status;`,
    'Count by status'
  );
  if (statusCounts) {
    statusCounts.split('\n').forEach(line => {
      const [status, count] = line.split('|');
      console.log(`  ${status}: ${count}`);
    });
  }

  console.log('\n✅ Database verification completed successfully!');
  console.log('\n💡 Test queries executed:');
  console.log('  ✓ SELECT with COUNT from all tables');
  console.log('  ✓ SELECT with JOIN (users + departments)');
  console.log('  ✓ SELECT with multiple JOINs (notifications + types + departments)');
  console.log('  ✓ SELECT with ORDER BY DESC');
  console.log('  ✓ Aggregation query (GROUP BY status)');
} catch (error) {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
}

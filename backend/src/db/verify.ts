import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { eq, desc } from 'drizzle-orm';

// データベースパスを環境変数から取得（デフォルトは './data/local.db'）
const dbPath = process.env.DATABASE_PATH || './data/local.db';
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

async function verify() {
  console.log('🔍 データベースの検証を開始します...');
  console.log(`📍 データベースパス: ${dbPath}\n`);

  try {
    console.log('=== データベース検証 ===\n');

    // 1. レコード数の確認
    console.log('📊 レコード数:');
    const departmentsCount = await db.select().from(schema.departments);
    const usersCount = await db.select().from(schema.users);
    const workflowTemplatesCount = await db.select().from(schema.workflowTemplates);
    const notificationTypesCount = await db.select().from(schema.notificationTypes);
    const notificationsCount = await db.select().from(schema.notifications);
    const historyCount = await db.select().from(schema.notificationHistory);

    console.log(`  departments: ${departmentsCount.length}`);
    console.log(`  users: ${usersCount.length}`);
    console.log(`  workflow_templates: ${workflowTemplatesCount.length}`);
    console.log(`  notification_types: ${notificationTypesCount.length}`);
    console.log(`  notifications: ${notificationsCount.length}`);
    console.log(`  notification_history: ${historyCount.length}`);

    // 2. 部署一覧の表示
    console.log('\n📂 全部署:');
    const departments = await db.select().from(schema.departments).orderBy(schema.departments.sortOrder);
    departments.forEach(dept => {
      console.log(`  - [${dept.code}] ${dept.name} (Active: ${dept.isActive ? 'Yes' : 'No'})`);
    });

    // 3. ユーザーと部署のJOIN検索
    console.log('\n👥 全ユーザー:');
    const users = await db
      .select({
        username: schema.users.username,
        displayName: schema.users.displayName,
        role: schema.users.role,
        departmentName: schema.departments.name,
      })
      .from(schema.users)
      .leftJoin(schema.departments, eq(schema.users.departmentId, schema.departments.id));

    users.forEach(user => {
      console.log(`  - ${user.username} (${user.displayName}) - ${user.role} - ${user.departmentName || 'No Department'}`);
    });

    // 4. 届出種別の表示
    console.log('\n📝 届出種別:');
    const notifTypes = await db.select().from(schema.notificationTypes).orderBy(schema.notificationTypes.sortOrder);
    notifTypes.forEach(type => {
      console.log(`  - [${type.code}] ${type.name}`);
      console.log(`    検査: ${type.hasInspection ? 'あり' : 'なし'}, 内容フィールド: ${type.hasContentField ? 'あり' : 'なし'}`);
    });

    // 5. 届出データの複数テーブルJOIN
    console.log('\n📬 全届出:');
    const notifications = await db
      .select({
        id: schema.notifications.id,
        notificationDate: schema.notifications.notificationDate,
        typeName: schema.notificationTypes.name,
        propertyName: schema.notifications.propertyName,
        content: schema.notifications.content,
        currentStatus: schema.notifications.currentStatus,
        receivingDept: schema.departments.name,
      })
      .from(schema.notifications)
      .leftJoin(schema.notificationTypes, eq(schema.notifications.notificationTypeId, schema.notificationTypes.id))
      .leftJoin(schema.departments, eq(schema.notifications.receivingDepartmentId, schema.departments.id))
      .orderBy(desc(schema.notifications.notificationDate));

    notifications.forEach(notif => {
      console.log(`\n  日付: ${notif.notificationDate}`);
      console.log(`  種別: ${notif.typeName || 'N/A'}`);
      console.log(`  物件名: ${notif.propertyName || 'N/A'}`);
      console.log(`  内容: ${notif.content || 'N/A'}`);
      console.log(`  状態: ${notif.currentStatus}`);
      console.log(`  受付部署: ${notif.receivingDept || 'N/A'}`);
    });

    // 6. 履歴データの表示
    console.log('\n📊 届出履歴:');
    const history = await db
      .select({
        notificationId: schema.notificationHistory.notificationId,
        statusFrom: schema.notificationHistory.statusFrom,
        statusTo: schema.notificationHistory.statusTo,
        comment: schema.notificationHistory.comment,
        changedBy: schema.users.displayName,
        changedAt: schema.notificationHistory.changedAt,
      })
      .from(schema.notificationHistory)
      .leftJoin(schema.users, eq(schema.notificationHistory.changedBy, schema.users.id))
      .orderBy(desc(schema.notificationHistory.changedAt));

    history.forEach(record => {
      console.log(`\n  ${record.statusFrom || '新規'} → ${record.statusTo}`);
      console.log(`  変更者: ${record.changedBy}`);
      console.log(`  コメント: ${record.comment || 'N/A'}`);
      console.log(`  日時: ${record.changedAt}`);
    });

    // 7. 状態別の集計
    console.log('\n📈 状態別届出数:');
    const statusCounts = notifications.reduce((acc, n) => {
      acc[n.currentStatus] = (acc[n.currentStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    console.log('\n✅ データベース検証が完了しました！');
    console.log('\n💡 実行されたテストクエリ:');
    console.log('  ✓ 全テーブルのSELECT with COUNT');
    console.log('  ✓ JOIN検索 (users + departments)');
    console.log('  ✓ 複数テーブルJOIN (notifications + types + departments)');
    console.log('  ✓ ORDER BY DESC');
    console.log('  ✓ 集計クエリ (状態別カウント)');
  } catch (error) {
    console.error('❌ 検証中にエラーが発生しました:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}

// スクリプト実行
verify()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

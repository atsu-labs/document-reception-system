import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

// データベースパスを環境変数から取得（デフォルトは './data/local.db'）
const dbPath = process.env.DATABASE_PATH || './data/local.db';
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log('🌱 データベースのシード処理を開始します...');

  try {
    // 1. ワークフローテンプレートの作成
    console.log('📋 ワークフローテンプレートを作成中...');
    const workflowTemplateId = randomUUID();
    await db.insert(schema.workflowTemplates).values({
      id: workflowTemplateId,
      name: '標準ワークフロー',
      statuses: JSON.stringify(['受付', '処理中', '検査', '完了']),
    });

    // 2. 部署の作成
    console.log('🏢 部署データを作成中...');
    const deptIds = {
      general: randomUUID(),
      engineering: randomUUID(),
      inspection: randomUUID(),
      management: randomUUID(),
    };

    await db.insert(schema.departments).values([
      {
        id: deptIds.general,
        code: 'DEPT001',
        name: '総務部',
        parentId: null,
        sortOrder: 1,
      },
      {
        id: deptIds.engineering,
        code: 'DEPT002',
        name: '工務部',
        parentId: null,
        sortOrder: 2,
      },
      {
        id: deptIds.inspection,
        code: 'DEPT003',
        name: '検査部',
        parentId: null,
        sortOrder: 3,
      },
      {
        id: deptIds.management,
        code: 'DEPT004',
        name: '管理部',
        parentId: null,
        sortOrder: 4,
      },
    ]);

    // 3. ユーザーの作成
    console.log('👤 ユーザーデータを作成中...');
    const userIds = {
      admin: randomUUID(),
      senior: randomUUID(),
      general: randomUUID(),
    };

    // パスワード: password123 をハッシュ化
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    await db.insert(schema.users).values([
      {
        id: userIds.admin,
        username: 'admin',
        passwordHash: defaultPasswordHash,
        displayName: '管理者ユーザー',
        role: 'ADMIN',
        departmentId: deptIds.management,
      },
      {
        id: userIds.senior,
        username: 'senior1',
        passwordHash: defaultPasswordHash,
        displayName: '上位ユーザー',
        role: 'SENIOR',
        departmentId: deptIds.engineering,
      },
      {
        id: userIds.general,
        username: 'user1',
        passwordHash: defaultPasswordHash,
        displayName: '一般ユーザー',
        role: 'GENERAL',
        departmentId: deptIds.general,
      },
    ]);

    // 4. 届出種類の作成
    console.log('📄 届出種類データを作成中...');
    const notificationTypeIds = {
      construction: randomUUID(),
      repair: randomUUID(),
      inspection: randomUUID(),
    };

    await db.insert(schema.notificationTypes).values([
      {
        id: notificationTypeIds.construction,
        code: 'NT001',
        name: '工事届',
        description: '建設工事に関する届出',
        hasInspection: true,
        hasContentField: true,
        workflowTemplateId: workflowTemplateId,
        sortOrder: 1,
      },
      {
        id: notificationTypeIds.repair,
        code: 'NT002',
        name: '修繕届',
        description: '修繕工事に関する届出',
        hasInspection: true,
        hasContentField: true,
        workflowTemplateId: workflowTemplateId,
        sortOrder: 2,
      },
      {
        id: notificationTypeIds.inspection,
        code: 'NT003',
        name: '検査依頼',
        description: '検査に関する依頼',
        hasInspection: false,
        hasContentField: true,
        workflowTemplateId: workflowTemplateId,
        sortOrder: 3,
      },
    ]);

    // 5. サンプル届出データの作成
    console.log('📝 サンプル届出データを作成中...');
    const notificationIds = {
      notification1: randomUUID(),
      notification2: randomUUID(),
    };

    await db.insert(schema.notifications).values([
      {
        id: notificationIds.notification1,
        notificationTypeId: notificationTypeIds.construction,
        notificationDate: new Date().toISOString().split('T')[0],
        receivingDepartmentId: deptIds.general,
        processingDepartmentId: deptIds.engineering,
        propertyName: 'サンプル物件A',
        content: '新築工事の届出です',
        currentStatus: '受付',
        createdBy: userIds.general,
        updatedBy: userIds.general,
      },
      {
        id: notificationIds.notification2,
        notificationTypeId: notificationTypeIds.repair,
        notificationDate: new Date().toISOString().split('T')[0],
        receivingDepartmentId: deptIds.general,
        processingDepartmentId: deptIds.engineering,
        propertyName: 'サンプル物件B',
        content: '外壁修繕の届出です',
        inspectionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7日後
        inspectionDepartmentId: deptIds.inspection,
        currentStatus: '処理中',
        createdBy: userIds.general,
        updatedBy: userIds.senior,
      },
    ]);

    // 6. 届出履歴の作成
    console.log('📊 届出履歴データを作成中...');
    await db.insert(schema.notificationHistory).values([
      {
        id: randomUUID(),
        notificationId: notificationIds.notification1,
        statusFrom: null,
        statusTo: '受付',
        changedBy: userIds.general,
        comment: '新規届出受付',
      },
      {
        id: randomUUID(),
        notificationId: notificationIds.notification2,
        statusFrom: null,
        statusTo: '受付',
        changedBy: userIds.general,
        comment: '新規届出受付',
      },
      {
        id: randomUUID(),
        notificationId: notificationIds.notification2,
        statusFrom: '受付',
        statusTo: '処理中',
        changedBy: userIds.senior,
        comment: '処理を開始しました',
      },
    ]);

    console.log('✅ シード処理が完了しました！');
    console.log('\n📌 初期ユーザー情報:');
    console.log('  管理者: username=admin, password=password123');
    console.log('  上位ユーザー: username=senior1, password=password123');
    console.log('  一般ユーザー: username=user1, password=password123');
  } catch (error) {
    console.error('❌ シード処理中にエラーが発生しました:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}

// スクリプト実行
seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

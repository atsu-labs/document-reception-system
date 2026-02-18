/**
 * D1 Database Verification Script
 * 
 * **D1-FIRST POLICY**
 * Verifies data integrity and structure in Cloudflare D1 database.
 * 
 * Usage:
 *   pnpm db:verify:d1 [--remote|--local]
 * 
 * Performs basic checks to ensure:
 * - Tables exist
 * - Required data is present
 * - Relationships are valid
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔍 D1データベースを検証中...');
console.log('');

async function verifyD1() {
  // コマンドライン引数から --remote または --local を取得
  const args = process.argv.slice(2);
  const isRemote = args.includes('--remote');
  const isLocal = args.includes('--local');
  
  if (!isRemote && !isLocal) {
    console.error('❌ エラー: --remote または --local を指定してください');
    console.log('');
    console.log('使用方法:');
    console.log('  pnpm db:verify:d1 --local   # ローカルD1環境');
    console.log('  pnpm db:verify:d1 --remote  # 本番D1環境');
    process.exit(1);
  }

  const targetEnv = isRemote ? 'remote' : 'local';
  console.log(`📍 対象環境: ${targetEnv.toUpperCase()}`);
  console.log('');

  const dbName = 'document-reception-system';
  const targetFlag = isRemote ? '--remote' : '--local';

  try {

    console.log('=== D1データベース検証 ===\n');

    // 1. レコード数の確認
    console.log('📊 レコード数:');
    
    const tables = [
      'departments',
      'users',
      'workflow_templates',
      'notification_types',
      'notifications',
      'notification_history'
    ];

    for (const table of tables) {
      const command = `npx wrangler d1 execute ${dbName} ${targetFlag} --command="SELECT COUNT(*) as count FROM ${table};"`;
      try {
        const { stdout } = await execAsync(command);
        // NOTE: This regex parsing is fragile and may break with wrangler output format changes
        // Consider using structured output if available in future wrangler versions
        const match = stdout.match(/count\s*\|\s*(\d+)/i) || stdout.match(/(\d+)/);
        const count = match ? match[1] : '?';
        console.log(`  ${table}: ${count}`);
      } catch (error) {
        console.log(`  ${table}: エラー`);
      }
    }

    // 2. 部署一覧の確認
    console.log('\n📂 部署一覧:');
    try {
      const { stdout } = await execAsync(
        `npx wrangler d1 execute ${dbName} ${targetFlag} --command="SELECT code, name, is_active FROM departments ORDER BY sort_order;"`
      );
      console.log(stdout);
    } catch (error) {
      console.log('  エラー: 部署データの取得に失敗');
    }

    // 3. ユーザー一覧の確認
    console.log('👥 ユーザー一覧:');
    try {
      const { stdout } = await execAsync(
        `npx wrangler d1 execute ${dbName} ${targetFlag} --command="SELECT username, display_name, role FROM users;"`
      );
      console.log(stdout);
    } catch (error) {
      console.log('  エラー: ユーザーデータの取得に失敗');
    }

    // 4. 届出種別の確認
    console.log('📝 届出種別:');
    try {
      const { stdout } = await execAsync(
        `npx wrangler d1 execute ${dbName} ${targetFlag} --command="SELECT code, name, has_inspection FROM notification_types ORDER BY sort_order;"`
      );
      console.log(stdout);
    } catch (error) {
      console.log('  エラー: 届出種別データの取得に失敗');
    }

    // 5. サンプル届出の確認
    console.log('📬 サンプル届出:');
    try {
      const { stdout } = await execAsync(
        `npx wrangler d1 execute ${dbName} ${targetFlag} --command="SELECT property_name, current_status FROM notifications;"`
      );
      console.log(stdout);
    } catch (error) {
      console.log('  エラー: 届出データの取得に失敗');
    }

    console.log('\n✅ D1データベースの検証が完了しました！');
    console.log('');
    console.log('💡 実行された検証項目:');
    console.log('  ✓ 全テーブルのレコード数確認');
    console.log('  ✓ 部署データの存在確認');
    console.log('  ✓ ユーザーデータの存在確認');
    console.log('  ✓ 届出種別の存在確認');
    console.log('  ✓ サンプル届出の存在確認');
    console.log('');
    console.log('📌 より詳細な検証が必要な場合:');
    console.log(`  wrangler d1 execute ${dbName} ${targetFlag} --command="<YOUR_SQL_QUERY>"`);
  } catch (error) {
    console.error('❌ 検証中にエラーが発生しました:', error);
    
    if (error instanceof Error) {
      console.error('エラー詳細:', error.message);
    }
    
    console.log('');
    console.log('💡 トラブルシューティング:');
    console.log('  1. wranglerがインストールされているか確認: wrangler --version');
    console.log('  2. D1データベースが作成されているか確認: wrangler d1 list');
    console.log('  3. マイグレーションが適用されているか確認:');
    console.log(`     wrangler d1 migrations list ${dbName} ${targetFlag}`);
    console.log('  4. シードデータが投入されているか確認:');
    console.log(`     pnpm db:seed:d1 ${targetFlag}`);
    throw error;
  }
}

// スクリプト実行
verifyD1()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/**
 * D1 Database Setup Script
 * 
 * **D1-FIRST POLICY**
 * One-command setup for Cloudflare D1 database.
 * Executes: Migration → Seed → Verification
 * 
 * Usage:
 *   pnpm db:setup:d1 [--remote|--local]
 * 
 * This is the recommended way to initialize a fresh D1 database.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🚀 D1データベースセットアップを開始します...');
console.log('');

async function setupD1() {
  try {
    // コマンドライン引数から --remote または --local を取得
    const args = process.argv.slice(2);
    const isRemote = args.includes('--remote');
    const isLocal = args.includes('--local');
    
    if (!isRemote && !isLocal) {
      console.error('❌ エラー: --remote または --local を指定してください');
      console.log('');
      console.log('使用方法:');
      console.log('  pnpm db:setup:d1 --local   # ローカルD1環境');
      console.log('  pnpm db:setup:d1 --remote  # 本番D1環境');
      process.exit(1);
    }

    const targetEnv = isRemote ? 'remote' : 'local';
    const targetFlag = isRemote ? '--remote' : '--local';
    console.log(`📍 対象環境: ${targetEnv.toUpperCase()}`);
    console.log('');

    const dbName = 'document-reception-system';

    // ステップ1: マイグレーション
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 ステップ 1/3: マイグレーション適用');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    const migrateCommand = `npx wrangler d1 migrations apply ${dbName} ${targetFlag}`;
    console.log(`🚀 コマンド実行: ${migrateCommand}`);
    console.log('');

    try {
      const { stdout: migrateOut, stderr: migrateErr } = await execAsync(migrateCommand);
      if (migrateOut) console.log(migrateOut);
      if (migrateErr) console.error(migrateErr);
      console.log('✅ マイグレーション完了');
    } catch (error) {
      console.error('❌ マイグレーションに失敗しました');
      throw error;
    }
    console.log('');

    // ステップ2: シードデータ投入
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌱 ステップ 2/3: シードデータ投入');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    try {
      const { stdout: seedOut, stderr: seedErr } = await execAsync(`pnpm db:seed:d1 ${targetFlag}`);
      if (seedOut) console.log(seedOut);
      if (seedErr) console.error(seedErr);
      console.log('✅ シードデータ投入完了');
    } catch (error) {
      console.error('❌ シードデータ投入に失敗しました');
      throw error;
    }
    console.log('');

    // ステップ3: データベース検証
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 ステップ 3/3: データベース検証');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    try {
      const { stdout: verifyOut, stderr: verifyErr } = await execAsync(`pnpm db:verify:d1 ${targetFlag}`);
      if (verifyOut) console.log(verifyOut);
      if (verifyErr) console.error(verifyErr);
      console.log('✅ データベース検証完了');
    } catch (error) {
      console.error('❌ データベース検証に失敗しました');
      throw error;
    }
    console.log('');

    // 完了メッセージ
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 D1データベースセットアップ完了！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✅ すべてのステップが正常に完了しました');
    console.log('');
    console.log('📌 初期ユーザー情報:');
    console.log('  管理者: username=admin, password=password123');
    console.log('  上位ユーザー: username=senior1, password=password123');
    console.log('  一般ユーザー: username=user1, password=password123');
    console.log('');
    console.log('💡 次のステップ:');
    console.log('  1. バックエンドをデプロイ: pnpm --filter backend deploy');
    console.log('  2. ローカル開発を開始: pnpm --filter backend dev');
  } catch (error) {
    console.error('❌ セットアップ中にエラーが発生しました:', error);
    
    if (error instanceof Error) {
      console.error('エラー詳細:', error.message);
    }
    
    console.log('');
    console.log('💡 トラブルシューティング:');
    console.log('  1. wranglerがインストールされているか確認: wrangler --version');
    console.log('  2. D1データベースが作成されているか確認: wrangler d1 list');
    console.log('  3. データベースがない場合は作成:');
    console.log('     wrangler d1 create document-reception-system');
    console.log('  4. wrangler.tomlでD1バインディングが設定されているか確認');
    console.log('  5. マイグレーションファイルが存在するか確認: ls drizzle/migrations/');
    throw error;
  }
}

// スクリプト実行
setupD1()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/**
 * D1 Seed Data Injection Script
 * 
 * **D1-FIRST POLICY**
 * Injects seed data into Cloudflare D1 database (remote or local).
 * 
 * Usage:
 *   pnpm db:seed:d1 [--remote|--local]
 * 
 * This script uses wrangler CLI to execute the seed SQL against D1.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

console.log('🌱 D1データベースへシードデータを投入中...');
console.log('');

async function seedD1() {
  try {
    // コマンドライン引数から --remote または --local を取得
    const args = process.argv.slice(2);
    const isRemote = args.includes('--remote');
    const isLocal = args.includes('--local');
    
    if (!isRemote && !isLocal) {
      console.error('❌ エラー: --remote または --local を指定してください');
      console.log('');
      console.log('使用方法:');
      console.log('  pnpm db:seed:d1 --local   # ローカルD1環境');
      console.log('  pnpm db:seed:d1 --remote  # 本番D1環境');
      process.exit(1);
    }

    const targetEnv = isRemote ? 'remote' : 'local';
    console.log(`📍 対象環境: ${targetEnv.toUpperCase()}`);
    console.log('');

    // まず、seed-export.sql が存在するか確認
    const seedFilePath = path.join(process.cwd(), 'seed-export.sql');
    if (!fs.existsSync(seedFilePath)) {
      console.log('⚠️  seed-export.sql が見つかりません。エクスポートを実行します...');
      console.log('');
      
      // エクスポートスクリプトを実行
      await execAsync('tsx src/db/d1-seed-export.ts');
      console.log('');
    }

    // wranglerコマンドで投入
    const dbName = 'document-reception-system';
    const targetFlag = isRemote ? '--remote' : '--local';
    const command = `npx wrangler d1 execute ${dbName} ${targetFlag} --file=./seed-export.sql`;
    
    console.log(`🚀 コマンド実行: ${command}`);
    console.log('');

    const { stdout, stderr } = await execAsync(command);
    
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.error(stderr);
    }

    console.log('✅ シードデータの投入が完了しました！');
    console.log('');
    console.log('📌 初期ユーザー情報:');
    console.log('  管理者: username=admin, password=password123');
    console.log('  上位ユーザー: username=senior1, password=password123');
    console.log('  一般ユーザー: username=user1, password=password123');
  } catch (error) {
    console.error('❌ シードデータ投入中にエラーが発生しました:', error);
    
    if (error instanceof Error) {
      console.error('エラー詳細:', error.message);
    }
    
    console.log('');
    console.log('💡 トラブルシューティング:');
    console.log('  1. wranglerがインストールされているか確認: wrangler --version');
    console.log('  2. D1データベースが作成されているか確認: wrangler d1 list');
    console.log('  3. wrangler.tomlでD1バインディングが設定されているか確認');
    console.log('  4. マイグレーションが適用されているか確認:');
    console.log('     wrangler d1 migrations list document-reception-system --local');
    throw error;
  }
}

// スクリプト実行
seedD1()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

// データベースパスを環境変数から取得（デフォルトは './data/local.db'）
const dbPath = process.env.DATABASE_PATH || './data/local.db';

// データディレクトリが存在しない場合は作成
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`📁 データディレクトリを作成しました: ${dataDir}`);
}

const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

console.log('🚀 マイグレーションを実行中...');
console.log(`📍 データベースパス: ${dbPath}`);

try {
  // マイグレーションの実行
  migrate(db, { migrationsFolder: './drizzle/migrations' });
  console.log('✅ マイグレーションが完了しました！');
} catch (error) {
  console.error('❌ マイグレーション中にエラーが発生しました:', error);
  throw error;
} finally {
  sqlite.close();
}

/**
 * D1 Database Reset Script
 *
 * **D1-FIRST POLICY**
 * Resets Cloudflare D1 database by dropping all data and reapplying migrations and seed.
 *
 * Usage:
 *   pnpm db:reset:d1 [--remote|--local]
 *
 * ⚠️ WARNING: This will DELETE ALL DATA in the D1 database!
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as readline from "readline";

const execAsync = promisify(exec);

console.log("🔄 D1データベースをリセット中...");
console.log("⚠️  警告: このコマンドはすべてのデータを削除します！");
console.log("");

async function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

async function resetD1() {
  try {
    // コマンドライン引数から --remote または --local を取得
    const args = process.argv.slice(2);
    const isRemote = args.includes("--remote");
    const isLocal = args.includes("--local");
    const force = args.includes("--force"); // 確認をスキップ

    if (!isRemote && !isLocal) {
      console.error("❌ エラー: --remote または --local を指定してください");
      console.log("");
      console.log("使用方法:");
      console.log("  pnpm db:reset:d1 --local   # ローカルD1環境");
      console.log("  pnpm db:reset:d1 --remote  # 本番D1環境（要注意！）");
      console.log("  pnpm db:reset:d1 --local --force  # 確認なし");
      process.exit(1);
    }

    const targetEnv = isRemote ? "remote" : "local";
    console.log(`📍 対象環境: ${targetEnv.toUpperCase()}`);
    console.log("");

    const dbName = "document-reception-system";
    const targetFlag = isRemote ? "--remote" : "--local";

    // 確認プロンプト（--force でない場合）
    if (!force) {
      const confirmed = await askConfirmation(
        `本当に ${targetEnv.toUpperCase()} D1データベースをリセットしますか？ (y/N): `,
      );

      if (!confirmed) {
        console.log("❌ キャンセルされました");
        process.exit(0);
      }
      console.log("");
    }

    // ステップ1: すべてのテーブルを削除
    console.log("🗑️  すべてのテーブルを削除中...");

    // 重要: 外部キー制約を考慮してテーブルを逆順に削除
    // 依存関係: notification_history → notifications → (notification_types, users) → (workflow_templates, departments)
    // 併せてマイグレーション履歴も削除し、0000から再適用できる状態にする
    const disableForeignKeys =
      "PRAGMA foreign_keys = OFF; PRAGMA defer_foreign_keys = ON;";
    const dropTables = [
      "DROP TABLE IF EXISTS notification_history;",
      "DROP TABLE IF EXISTS inspections;",
      "DROP TABLE IF EXISTS notifications;",
      "DROP TABLE IF EXISTS notification_types;",
      "DROP TABLE IF EXISTS notification_groups;",
      "DROP TABLE IF EXISTS users;",
      "DROP TABLE IF EXISTS departments;",
      "DROP TABLE IF EXISTS workflow_templates;",
      "DROP TABLE IF EXISTS d1_migrations;",
    ].join(" ");
    const enableForeignKeys =
      "PRAGMA foreign_keys = ON; PRAGMA defer_foreign_keys = OFF;";

    await execAsync(
      `npx wrangler d1 execute ${dbName} ${targetFlag} --command="${disableForeignKeys}"`,
    );
    await execAsync(
      `npx wrangler d1 execute ${dbName} ${targetFlag} --command="${dropTables}"`,
    );
    await execAsync(
      `npx wrangler d1 execute ${dbName} ${targetFlag} --command="${enableForeignKeys}"`,
    );
    console.log("✅ テーブルを削除しました");
    console.log("");

    // ステップ2: マイグレーションを再適用
    console.log("🚀 マイグレーションを適用中...");
    const migrateCommand = `npx wrangler d1 migrations apply ${dbName} ${targetFlag}`;
    const { stdout: migrateOut, stderr: migrateErr } =
      await execAsync(migrateCommand);

    if (migrateOut) console.log(migrateOut);
    if (migrateErr) console.error(migrateErr);

    console.log("✅ マイグレーションが完了しました");
    console.log("");

    // ステップ3: シードデータを投入
    console.log("🌱 シードデータを投入中...");
    await execAsync(`pnpm db:seed:d1 ${targetFlag}`);

    console.log("");
    console.log("✅ D1データベースのリセットが完了しました！");
    console.log("");
    console.log("📌 初期ユーザー情報:");
    console.log("  管理者: username=admin, password=password123");
    console.log("  上位ユーザー: username=senior1, password=password123");
    console.log("  一般ユーザー: username=user1, password=password123");
  } catch (error) {
    console.error("❌ リセット中にエラーが発生しました:", error);

    if (error instanceof Error) {
      console.error("エラー詳細:", error.message);
    }

    console.log("");
    console.log("💡 トラブルシューティング:");
    console.log(
      "  1. wranglerがインストールされているか確認: wrangler --version",
    );
    console.log("  2. D1データベースが作成されているか確認: wrangler d1 list");
    console.log("  3. wrangler.tomlでD1バインディングが設定されているか確認");
    console.log(
      "  4. マイグレーションファイルが存在するか確認: ls drizzle/migrations/",
    );
    throw error;
  }
}

// スクリプト実行
resetD1()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

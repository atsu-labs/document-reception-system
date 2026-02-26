# 届出管理システム 分析レポート

## 1. システム概要
本システムは、組織内での申請・届出業務を管理するためのWebアプリケーションです。

### 技術スタック
- **バックエンド**: Hono, Drizzle ORM, Cloudflare D1
- **フロントエンド**: React (v18), Vite, React Router v7, TanStack Query, Zustand, shadcn/ui

## 2. ドキュメントとコードの相違点

| 項目 | ドキュメント (`system_specification.md`) | 実際のコード (Implementation) |
| :--- | :--- | :--- |
| **検査管理** | `notifications`テーブルのフィールドとして保持 | 独立した`inspections`テーブルで複数回対応 |
| **届出種類** | フラットなマスタ構造 | `parentGroupId`による階層・グループ管理 |
| **データ拡張** | 固定フィールドのみ | JSON形式の`additionalData`による動的拡張 |
| **管理UI** | 個別管理画面への言及のみ | `/admin/master-data` 統合ダッシュボード |
| **Routing** | React Router v6 / TanStack Router | React Router v7 |
| **ディレクトリ** | `shared/`ディレクトリでの型共有 | `frontend/src/types`等に分散 |

## 3. 結論
実装は初期設計から大幅に拡張されており、より実務的な要件（複数回検査や柔軟な届出定義）に対応した状態になっています。

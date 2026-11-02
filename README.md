# 概要
- 技術検証 → アプリケーションとして表現する


# モノレポ構成

このリポジトリは pnpm workspaces を使用したモノレポ構成です。

## パッケージ一覧

- `packages/mahjong-api` - 麻雀スコア管理API（Hono + Prisma）
- `packages/share-photo-api` - 写真共有API（Hono + Prisma）
- `packages/gsc-trigger` - Google Cloud Storage トリガー関数

## 開発方法

### セットアップ

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env
# packages/commonにも.envをコピー（Prismaマイグレーション用）
cp .env packages/common/.env

# テスト用データベースの起動（Docker）
pnpm db:up

# Prisma Clientの生成
pnpm prisma:generate

# データベースマイグレーションの実行
pnpm prisma:migrate

# 全パッケージのビルド
pnpm build

# 全パッケージのテスト実行
pnpm test

# 全パッケージのLint実行
pnpm lint
```

### データベース管理

```bash
# テスト用データベースの起動
pnpm db:up

# テスト用データベースの停止
pnpm db:down

# テスト用データベースのリセット（データを削除して再起動）
pnpm db:reset

# Prisma Studioの起動（データベースGUI）
pnpm prisma:studio
```

### 個別パッケージの操作

```bash
# 特定のパッケージで作業
cd packages/mahjong-api
pnpm dev

# 特定のパッケージでコマンド実行
pnpm --filter @asobiba/mahjong-api dev
```

## データベース構成

### テスト用データベース（Docker）

このプロジェクトでは、Dockerを使用してローカル開発およびテスト用のPostgreSQLデータベースを提供しています。

#### 仕様
- **データベース**: PostgreSQL 16 (Alpine Linux)
- **ユーザー名**: `asobiba`
- **パスワード**: `asobiba`
- **データベース名**: `asobiba_test`
- **ポート**: `5432`
- **接続URL**: `postgresql://asobiba:asobiba@localhost:5432/asobiba_test?schema=public`

#### 使用方法

```bash
# 1. データベースの起動
pnpm db:up

# 2. 環境変数をpackages/commonにコピー（Prismaマイグレーション用）
# 注: Prismaはスキーマファイルと同じディレクトリの.envを読み込むため、
#     ルートの.envとは別にpackages/commonにもコピーが必要です
cp .env packages/common/.env

# 3. マイグレーションの実行
pnpm prisma:migrate

# 4. データベースの確認（Prisma Studio）
pnpm prisma:studio
```

#### データの永続化

データベースのデータはDockerボリューム `asobiba_postgres_data` に保存されます。
- `pnpm db:down` でコンテナを停止してもデータは保持されます
- `pnpm db:reset` でボリュームを削除し、完全にリセットできます

#### トラブルシューティング

ポート5432が既に使用されている場合は、`docker-compose.yml` のポートマッピングを変更してください：
```yaml
ports:
  - "5433:5432"  # ローカルの5433ポートを使用
```

この場合、`.env` ファイルのDATABASE_URLも更新が必要です：
```
DATABASE_URL="postgresql://asobiba:asobiba@localhost:5433/asobiba_test?schema=public"
```

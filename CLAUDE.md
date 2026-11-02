# CLAUDE.md

このリポジトリで Claude Code が作業するときの決め事です。

## コミュニケーション

- ユーザーとの会話、コミットメッセージ、PR のタイトル・説明は日本語で書く。

## 役割分担

- 実装: Claude Code（このファイルに従う）
- コードレビュー: GitHub Copilot（`.github/copilot-instructions.md` に従う）
- 決め事を変えたときは、両方のファイルの内容を揃える。

## 実装の進め方

実装は次の 3 ステップで進める。**各ステップの終わりで必ず手を止めてフィードバックを求め、承認を得てから次へ進む。**

1. **I/F の定義**
   - ユースケース（`port/in`）、外部依存（`port/out`）、ドメインモデルの公開シグネチャ、API の入出力スキーマを定義する。
   - 中身は書かない（型・interface・シグネチャのみ）。
2. **テストコードの追加**
   - 1 で定義した I/F に対するテストを書く。この時点ではテストが失敗する（Red）ことを確認して報告する。
3. **実装**
   - テストが通る最小限の実装を行い、必要ならリファクタリングする。
   - `pnpm build` / `pnpm test` / `pnpm lint` が通ることを確認して報告する。

PR はステップごとに 1 つ作る（I/F 定義の PR → テストの PR → 実装の PR）。前のステップの PR がマージされてから次のステップに進む。

途中で I/F の変更が必要になった場合は、勝手に変えずに理由を示して相談する。

## アーキテクチャ

ヘキサゴナルアーキテクチャを採用する。
参考実装: [ysmt067/ts-sample の packages/hexagonal-architecture](https://github.com/ysmt067/ts-sample/tree/main/packages/hexagonal-architecture)

### ディレクトリ構成（パッケージ内）

```
src/
├── application/
│   ├── domain/
│   │   ├── model/          # エンティティ・値オブジェクト
│   │   └── service/        # ユースケースの実装。port/in の interface を implements する
│   └── port/
│       ├── in/             # ユースケースの interface と入力（Command / Query）
│       └── out/            # 外部依存の interface
└── adapter/
    ├── in/
    │   └── web/            # Hono のルート・ハンドラー。リクエストを Command/Query に変換して UseCase を呼ぶ
    └── out/
        └── persistence/    # port/out の実装（Prisma など）
```

### ファイル名

ドット区切りで種類を表す今の付け方を続ける。名前部分は kebab-case。

| 置き場所 | 種類 | ファイル名の例 |
| --- | --- | --- |
| `domain/model` | エンティティ | `answer.entity.ts` |
| `domain/model` | 値オブジェクト | `summary.value.ts` |
| `domain/service` | ユースケースの実装 | `register-answer.service.ts` |
| `port/in` | ユースケースの interface | `register-answer.usecase.ts` |
| `port/in` | 入力（状態を変える） | `register-answer.command.ts` |
| `port/in` | 入力（参照する） | `get-answers.query.ts` |
| `port/out` | 外部依存の interface | `answer-repository.port.ts` |
| `adapter/in/web` | ルート・ハンドラー・スキーマ | `answers/post/handler.ts` など（今の `api/` 配下の構成と同じ） |
| `adapter/out/persistence` | `port/out` の実装 | `answer-repository.adapter.rdb.ts`（末尾にインフラ名） |
| 共通 | テスト | 対象ファイルと同じ場所に `xxx.test.ts` |

### 依存のルール

- `application/domain/model` は他のどの層にも依存しない。
- `application` は `adapter` や外部ライブラリ（Prisma・Hono・GCS など）に依存しない。外部とのやりとりは必ず `port/out` の interface を通す。
- `adapter` は `application/port` に依存してよい。逆方向の依存は禁止。
- 状態を変える操作は Command、参照する操作は Query として分ける。

### テストの方針

- テストフレームワークは Vitest。
- ドメインモデル: 外部依存なしの単体テスト。
- ドメインサービス（ユースケース）: `port/out` をモックしてテストする。
- アダプター: `adapter/in/web` は API の入出力を、`adapter/out/persistence` はテスト用 DB（`pnpm db:up`）に対してテストする。

## パッケージの分割

パッケージの切り分けはその都度相談して決める。基本の分け方は次のとおり。

| 種類 | 役割 |
| --- | --- |
| API パッケージ | API 単位。`adapter/in/web` とその組み立て（DI）を持つ |
| 共通処理パッケージ | ドメインに依存しない共通処理（`packages/common`） |
| コアドメインのパッケージ | 中核となるドメインの `application` 層 |
| サブドメインのパッケージ | 支援・汎用サブドメインの `application` 層 |

新しいパッケージを作るとき、既存パッケージの責務を動かすときは、実装に入る前に必ず相談する。

### 既存パッケージ

`mahjong-api` と `share-photo-api` は `api/` + `modules/` の旧構成のまま。ヘキサゴナル構成への移行は別途計画するので、それまでは勝手に構成を変えない。

## コマンド

ルートで実行する。

- 依存のインストール: `pnpm install`
- ビルド: `pnpm build`
- テスト: `pnpm test`（テスト DB が必要なものは先に `pnpm db:up`）
- Lint: `pnpm lint`
- 特定パッケージ: `pnpm --filter @asobiba/<name> <script>`

## PR

- PR は 1 PR = 1 主題。変更は 200 行以内・10 ファイル以内（`pr-size-file-count-check.yml` で検査される）に収まるよう分割する。
- PR はユーザーに頼まれたときだけ作成する。
- コミットメッセージは日本語で、1 行目に変更の要約を書く。

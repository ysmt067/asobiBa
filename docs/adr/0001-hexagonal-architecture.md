# 0001. ヘキサゴナルアーキテクチャを採用する

- ステータス: 提案中
- 日付: 2026-11-02

## コンテキスト

このリポジトリの API パッケージ（`mahjong-api`, `share-photo-api`）は、次の構成になっている。

```
src/
├── api/<path>/<method>/   # route.ts, schema.ts, handler.ts
└── modules/<domain>/      # xxx.entity.ts, xxx.query.ts, xxx.query.rdb.ts など
```

この構成には次の課題がある。

- **ユースケースの置き場所がない。** ハンドラー（`api/.../handler.ts`）が、リクエストの受け取り・ドメインの操作・レスポンスの組み立てをまとめて持っている。
- **ハンドラーがインフラの実装を直接知っている。** 例えば `HandsGetHander` は、依存が渡されないときに `new HandQueryRDB()` を自分で生成する。
- **ドメインが外部ライブラリに依存している。** エンティティや値オブジェクトが `zod` を import している。
- **ドメインとインフラの境界がパッケージごとに違う。** `mahjong-api` は `domain/` と `infrastructure/` に分けているが、`share-photo-api` は同じディレクトリに `xxx.query.ts` と `xxx.query.postgres.ts` を並べている。

今後は、実装を Claude Code、コードレビューを GitHub Copilot が担当し、「I/F の定義 → テストの追加 → 実装」の順に進める。この進め方では、I/F（ユースケースと外部依存の境界）を先に決められる構成が必要になる。

## 決定

ヘキサゴナルアーキテクチャ（ポートとアダプター）を採用する。参考実装は [ysmt067/ts-sample の packages/hexagonal-architecture](https://github.com/ysmt067/ts-sample/tree/main/packages/hexagonal-architecture) とする。

- パッケージ内を `application/{domain/{model,service}, port/{in,out}}` と `adapter/{in/web, out/persistence}` に分ける。
- 依存は外側から内側への一方向とする。`application` は `adapter` や外部ライブラリ（Prisma・Hono・GCS など）に依存せず、外部とのやりとりは `port/out` の interface を通す。
- ユースケースは `port/in` の interface として定義し、`domain/service` で実装する。入力は Command（状態を変える）と Query（参照する）に分ける。
- パッケージは、API 単位・共通処理・コアドメイン・サブドメインを基本に分け、切り分けはその都度決める。

ディレクトリ構成・ファイル名・テストの方針の詳細は `CLAUDE.md` に書く。

## 影響

### よくなること

- 「I/F の定義」のステップで、`port/in`・`port/out`・ドメインモデルのシグネチャを先に決めて合意できる。
- ユースケースを `port/out` のモックでテストでき、DB なしで振る舞いを確かめられる。
- インフラ（DB・ストレージ）の差し替えがアダプターの追加で済む。
- レビューで「どの層がどの層を import しているか」という機械的な観点を使える。

### 注意すること

- ファイル数と、ポートとアダプターの間の受け渡しのコードが増える。小さなユースケースでは手間に見える。
- 今ある `mahjong-api` と `share-photo-api` は旧構成のまま残る。移行するまでは 2 つの構成が混ざる。
- DI（どのアダプターをどのユースケースに渡すか）をどこで組み立てるかを、パッケージごとに決める必要がある。

## 検討した代替案

- **今の構成（`api/` + `modules/`）を続ける。** 学習コストはないが、上の課題が残る。ユースケースの境界がないため「I/F の定義」のステップと噛み合わない。
- **クリーンアーキテクチャ（エンティティ・ユースケース・インターフェースアダプター・フレームワークの 4 層）。** 依存の向きの考え方は同じだが、層が多い。ポートとアダプターの 2 種類で境界を表すヘキサゴナルのほうが、このリポジトリの規模に合う。

## 今後の対応

- `mahjong-api` と `share-photo-api` の移行は別途計画し、必要なら別の ADR に記録する。

# Active Context

> このファイルは AI が**毎ターン上書き更新**する現在状態のスナップショット。
> 過去ログは `progress.md` を見ること。ここには履歴を残さない。
> セッション開始時に AGENTS.md の直後に必ず読む。

## 現在の対象

- 何を / どこを: プロジェクト立ち上げ完了、**Phase 1（ゲームロジック実装）から Sonnet が着手予定**
- ステータス: Phase 0（足場） = 完了。Phase 1 = 未着手
- 最終更新: 2026-05-26

## 直近の観点・指摘

- 実装は **Sonnet が行う前提**で仕様書を書いてある。リテラル解釈を前提に、各タスクには受け入れ条件が付いている
- UI は**ダークモード固定**（zinc 基調）。Glass Pastel は採用しない
- 難易度は 3 種固定（Easy/Medium/Hard）、初手保護あり
- ロジックは `src/lib/` に純粋関数で集約、React 非依存に保つ（テスト容易性のため）

## 現フェーズで Read すべき設計書

Phase 1 着手時に必ず Read：
- `.agent/tasks.md`（フェーズ別タスク・受け入れ条件）
- `.agent/types.md`（型定義の完全な TS コード）
- `.agent/game-logic.md`（各関数の仕様と受け入れ条件）
- `.agent/architecture.md`（依存方向・データフロー）
- `.agent/conventions.md`（命名・コードスタイル・テスト方針）

Phase 2 着手時に追加で：
- `.agent/design-system.md`（ダークモード配色トークン）

## 未解決・次の一手

- [ ] Phase 1-1: Vite プロジェクト初期化（`npm create vite@latest`）
- [ ] Phase 1-2: Tailwind 導入
- [ ] Phase 1-3: 追加依存（lucide-react, vitest, prettier）
- [ ] Phase 1-4: `src/lib/types.ts` 作成
- [ ] 以降は tasks.md の順番どおり

## 関連ファイル / リンク

- GitHub: （初回 push 後に URL を記録）
- 主要仕様書: `.agent/` 配下すべて

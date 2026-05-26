# Active Context

> このファイルは AI が**毎ターン上書き更新**する現在状態のスナップショット。
> 過去ログは `progress.md` を見ること。ここには履歴を残さない。
> セッション開始時に AGENTS.md の直後に必ず読む。

## 現在の対象

- 何を / どこを: **Phase 1〜3 完了**、Phase 4（任意）が残り
- ステータス: Phase 1（ゲームロジック）= 完了 / Phase 2（UI）= 完了 / Phase 3（オーバーレイ・キーボード）= 完了
- 最終更新: 2026-05-26

## 直近の観点・指摘

- `npm run dev` でブラウザ上で実際にゲームが遊べる状態
- 型チェック（`tsc --noEmit`）とテスト（21件）は全パス
- Phase 3 のアニメーション（`transition-colors duration-150`、`animate-pulse`）は実装済み
- Phase 3 の長押し旗（モバイル対応）は未実装（任意）

## 現フェーズで Read すべき設計書

Phase 4（任意）着手時：
- `.agent/tasks.md`（Phase 4 タスク確認）
- README.md にスクリーンショット追加や GitHub Pages デプロイが対象

## 未解決・次の一手

- [ ] Phase 4-1: README.md にスクリーンショット追加（任意）
- [ ] Phase 4-2: GitHub Pages デプロイ（任意）
- [ ] Phase 3-3: 長押し旗（モバイル対応・任意、未実装）

## 関連ファイル / リンク

- GitHub: https://github.com/harukiti82/minesweeper
- コア型定義: `src/lib/types.ts`
- ゲームロジック: `src/lib/game.ts`
- フック: `src/hooks/useGame.ts`
- コンポーネント: `src/components/`

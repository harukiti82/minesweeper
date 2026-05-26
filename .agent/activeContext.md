# Active Context

> このファイルは AI が**毎ターン上書き更新**する現在状態のスナップショット。
> 過去ログは `progress.md` を見ること。ここには履歴を残さない。
> セッション開始時に AGENTS.md の直後に必ず読む。

## 現在の対象

- 何を / どこを: **Phase 1〜4-2 完了**、残り任意タスクのみ
- ステータス: Phase 1〜3 = 完了 / Phase 4-2（GitHub Pages）= 完了
- 最終更新: 2026-05-26

## 直近の観点・指摘

- GitHub Pages 公開済み: https://harukiti82.github.io/minesweeper/
- `vite.config.ts` に `base: '/minesweeper/'` 設定済み
- `.github/workflows/deploy.yml`: main push → 自動ビルド & デプロイ
- PR #1 を squash merge 済み（`a7252d0`）

## 現フェーズで Read すべき設計書

残タスクは任意のみ。新しい実装着手時は `.agent/tasks.md` を確認。

## 未解決・次の一手

- [ ] Phase 4-1: README.md にスクリーンショット追加（任意）
- [ ] Phase 3-3: 長押し旗（モバイル対応・任意、未実装）

## 関連ファイル / リンク

- GitHub: https://github.com/harukiti82/minesweeper
- コア型定義: `src/lib/types.ts`
- ゲームロジック: `src/lib/game.ts`
- フック: `src/hooks/useGame.ts`
- コンポーネント: `src/components/`

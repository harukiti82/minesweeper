# Progress Log

> AI が作業完了時に**末尾へ追記**する時系列ログ。新しいものほど下。
> 直近の作業のみ参照、エントリ 50 件を超えたら AI が「`progress-archive.md` に半分移送するか」を提案する。
> 自動削除はしない。常にユーザー確認を経る。

## 追記フォーマット

```markdown
## YYYY-MM-DD
- {一行サマリ。何を/どこを/結果}
- 関連コミット: `{shortsha}` `[種別] 概要`
- 次: {次にやることがあれば 1 行}
```

---

## 2026-05-26（プロジェクト開始 / Phase 0）

- リポジトリ初期化、`AGENTS.md` / `.agent/`（tasks/types/game-logic/architecture/conventions/design-system）配置
- GitHub に push（実装担当は Sonnet 前提で仕様書を整備）
- 次: Phase 1-1 Vite 初期化から Sonnet が着手

## 2026-05-26（Phase 1〜3 実装完了）

- Phase 1: Vite/Tailwind/lucide-react 足場、`src/lib/types.ts` + `src/lib/game.ts`、Vitest 21件全パス
- 関連コミット: `51c3034` `[機能追加] Phase 1: Vite/Tailwind 足場とゲームロジック実装`
- Phase 2+3: UI コンポーネント群（Cell/Board/StatusBar/DifficultySelector/GameOverlay）、キーボードショートカット(R/1/2/3)
- 関連コミット: `ff0c10f` `[機能追加] Phase 2+3: UI コンポーネントと勝敗オーバーレイ実装`
- 次: Phase 4（任意）— README スクショ追加 or GitHub Pages デプロイ

## 2026-05-26（Phase 4-2: GitHub Pages デプロイ）

- `vite.config.ts` に `base: '/minesweeper/'` 追加、`.github/workflows/deploy.yml` 作成（CI→Pages自動デプロイ）
- 関連コミット: `a7252d0` `[機能追加] GitHub Pages デプロイ設定を追加 (#1)` — PR #1 を squash merge
- 公開 URL: https://harukiti82.github.io/minesweeper/（main push 時に自動更新）
- 次: 残任意タスク（スクショ追加 / 長押し旗）のみ

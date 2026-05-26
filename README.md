# Minesweeper

ダークモードで映える Web 版マインスイーパー。React + Vite + TypeScript + Tailwind CSS。

## 状況

α（実装計画のみ）。Phase 0（足場とドキュメント）が完了、Phase 1 以降の実装は Claude Sonnet が `.agent/` の仕様に従って進める。

## 仕様

- 難易度: Easy (9×9 / 10 mines), Medium (16×16 / 40 mines), Hard (30×16 / 99 mines)
- 初手保護: 最初のクリックセルとその周囲8マスには地雷を配置しない
- 操作: 左クリック=開く、右クリック=旗
- UI: ダークモード固定（zinc 基調）

## 動かす（実装完了後）

```bash
npm install
npm run dev    # http://localhost:5173
```

| コマンド | 用途 |
|---|---|
| `npm run dev` | 開発サーバ |
| `npm run build` | 本番ビルド |
| `npm run typecheck` | 型チェック |
| `npm test` | Vitest（ゲームロジックのみ） |
| `npm run format` | Prettier |

## ドキュメント

- AI 向け規約: `AGENTS.md`
- 詳細仕様（Sonnet が実装時に Read する）: `.agent/`
  - `tasks.md` — フェーズ別タスク・受け入れ条件
  - `types.md` — 完全な TypeScript 型定義
  - `game-logic.md` — ゲームロジック仕様
  - `architecture.md` — レイヤ構成・依存方向
  - `conventions.md` — 命名・コード・テスト規約
  - `design-system.md` — ダークモード配色トークン
- 作業履歴: `.agent/activeContext.md` / `.agent/progress.md`

## ライセンス

未定（個人用）

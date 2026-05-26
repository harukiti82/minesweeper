# アーキテクチャ

## レイヤ構成

```
┌─────────────────────────────────────┐
│ components/  (React 表示層)         │  ← ロジックなし、props を受けて描画のみ
├─────────────────────────────────────┤
│ hooks/       (React 状態管理)       │  ← useReducer でゲーム状態を保持・dispatch
├─────────────────────────────────────┤
│ lib/         (純粋関数のロジック)    │  ← React 非依存、テスト容易
└─────────────────────────────────────┘
```

| 層 | 責務 | 依存先 |
|---|---|---|
| `components/` | UI 描画、イベントハンドリング | `hooks/`、`lib/types` |
| `hooks/` | 状態保持（useReducer）、副作用（タイマー） | `lib/` |
| `lib/` | ゲームロジック（純粋関数）、型定義 | （なし） |

## データフロー

```
[ユーザー操作]
    ↓ click / contextmenu
[Cell コンポーネント]
    ↓ onReveal() / onFlag() を呼ぶ
[useGame フック]
    ↓ dispatch({ type: 'REVEAL', row, col, now: Date.now() })
[reducer (lib/game.ts)]
    ↓ 新しい GameState を返す
[useReducer]
    ↓ state 更新
[Board / Cell が再レンダリング]
```

## 依存方向（厳守）

- `components/` → `hooks/` → `lib/` は OK
- `lib/` から `components/` や `hooks/` を import するのは禁止
- `lib/` 内で React を import するのも禁止（純粋に保つため）
- 循環依存禁止

理由: `lib/` を React 非依存にすることで Vitest でロジックを高速にテストできる。
UI を後から差し替えても（Canvas 化、別フレームワーク化）ロジックは流用できる。

## 主要データ型

`src/lib/types.ts` に集約。詳細は `.agent/types.md` を参照。
コア型: `Board`, `Cell`, `GameState`, `GameAction`, `DifficultyKey`。

## 実装の進め方フロー

1. **型定義から始める**: `.agent/types.md` の TS コードをそのまま `src/lib/types.ts` に
2. **テストを書きながらロジック実装**: `tests/game.test.ts` と `src/lib/game.ts` を同時進行
3. **フック実装**: `src/hooks/useGame.ts`（タイマー含む）
4. **UI 実装**: `Cell` → `Board` → `StatusBar` → `DifficultySelector` → `App` の順
5. **統合確認**: `npm run dev` でブラウザで遊ぶ

## 変更時の波及

- `Cell` 型に新フィールドを足すなら、`createBoard` の初期化、`revealCell` の更新ロジック、
  `Cell.tsx` の表示分岐をすべて見直す
- `GameAction` に新アクションを足すなら、`reducer`、`useGame` の dispatch 呼び出し元を見直す
- `DIFFICULTY_CONFIGS` を変えるなら、`DifficultySelector` のラベルとセルサイズ（design-system.md）も同期

## なぜ useReducer か（useState ではなく）

- ゲーム状態は複数フィールドが連動する（盤面・status・タイマー）
- アクション駆動にすることでテスト可能性が上がる（`reducer(state, action)` 単体テスト）
- Redux などの外部ライブラリは不要（React 標準で十分）

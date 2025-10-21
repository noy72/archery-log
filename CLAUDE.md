# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

アーチェリーの点数を記録・管理する Web アプリケーション。スマートフォンからの利用を想定したレスポンシブデザイン。

## Development Commands

```bash
# 開発サーバー起動
pnpm dev

# 本番ビルド
pnpm build

# 本番サーバー起動
pnpm start

# Lint
pnpm lint

# 型チェック
pnpm tsc --noEmit
```

### Firestore エミュレーター

開発環境では Firestore エミュレーターを使用：

```bash
# エミュレーター起動
gcloud beta emulators firestore start

# 別ターミナルで開発サーバー起動
pnpm dev
```

環境変数は `.env.local` で設定（`.env.example` を参照）。

## Architecture

### Server Components と Client Components の分離

- **Server Components**: データ取得とページレンダリング（`app/*/page.tsx`）
- **Client Components**: インタラクティブな操作のみ（`*Client.tsx`）
- Server Component でデータを取得し、Client Component に props で渡す

### Server Actions による状態管理

- API Routes を使用せず、すべてのデータ操作を Server Actions で実装
- **ページ固有の Actions**: 各ページディレクトリに `actions.ts` を配置（凝集性の向上）
- **共通 Actions**: `lib/actions.ts` に配置（複数ページで使用される Actions のみ）

例:
```
app/rounds/new/actions.ts          # initializeRound() - 新規ラウンド作成時のみ使用
app/rounds/[id]/actions.ts         # removeRound() - 記録詳細ページのみ使用
app/rounds/[id]/score/actions.ts   # modifyRound() - 点数入力ページのみ使用
lib/actions.ts                     # fetchRounds(), fetchRound() - 複数ページで使用
```

### 認証フロー

- **本番環境**: Google Cloud IAP によるヘッダーベース認証
  - `X-Goog-Authenticated-User-Email`
  - `X-Goog-Authenticated-User-Id`
- **開発環境**: ダミーユーザー（`dev_user_001`）を自動生成
- **ミドルウェア**: `middleware.ts` で認証チェックを一元管理し、未認証の場合はルートにリダイレクト

### Firestore とのデータ変換

- Firestore の `Timestamp` 型とアプリケーションの `Date` 型を明示的に変換
- `lib/rounds.ts` の `timestampToDate()` と `convertFirestoreToRound()` で変換処理を実装
- Server Component から Client Component への props 渡しで serialization エラーを回避

### 型安全性

- `any` 型を使用しない厳格な型チェック
- すべての型定義は `lib/types.ts` に集約
- Firestore データ型とアプリケーション型を明確に分離

## Key Implementation Patterns

### 単一 State でのフォーム管理

フォームデータは単一の state オブジェクトで管理：

```typescript
const [formData, setFormData] = useState<RoundFormData>({
  type: 'standard',
  distance: 30,
  // ...
});

const updateFormData = (updates: Partial<RoundFormData>) => {
  setFormData(prev => ({ ...prev, ...updates }));
};
```

### 途中保存と再開機能

- 点数入力中のデータは `modifyRound` で逐次保存
- `ends` 配列の `scores.length` で入力済みか判定
- 未完了ラウンドには「記録を続ける」ボタンを表示

### 統計計算での空エンド除外

統計計算時は必ず空のエンドを除外：

```typescript
const completedEnds = rounds.flatMap(r =>
  r.ends.filter(e => e.scores.length > 0)
);
```

## Data Flow

1. ユーザーが新規ラウンド設定画面でラウンド情報を入力
2. `app/rounds/new/actions.ts::initializeRound()` で空の `ends` 配列を持つ Round を作成
3. 点数入力画面で 1 射ごとに入力し、1 エンド完了時に `modifyRound()` で保存
4. 全エンド完了または「終了」ボタンで記録詳細画面に遷移
5. 記録一覧・統計画面では `fetchRounds()` で全ラウンドを取得し表示

## Deployment

- **Platform**: Google App Engine
- **Authentication**: Google Cloud IAP（本番環境のみ）
- **Database**: Firestore（本番環境）/ Firestore Emulator（開発環境）

デプロイコマンド:
```bash
gcloud app deploy
gcloud app browse
```

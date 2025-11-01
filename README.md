# アーチェリー記録アプリ

アーチェリーの点数を記録・管理する Web アプリケーション

## 機能

- ✅ ユーザー認証（IAP - Identity-Aware Proxy）
- ✅ ユーザー固有のデータアクセス制御
- ✅ ラウンド設定（30m/50m/70m、カスタム）
- ✅ 点数入力（タップで簡単入力）
- ✅ 記録履歴の閲覧
- ✅ 記録詳細の確認
- ✅ 途中から記録を再開
- ✅ 途中でラウンドを終了
- ✅ 統計データの表示
- ✅ 距離別の統計フィルター
- ✅ 共通ナビゲーションヘッダー
- ✅ レスポンシブデザイン（スマホ最適化）

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router)
- **バックエンド**: Server Actions (Server Functions)
- **認証**: Google Cloud IAP
- **スタイリング**: Tailwind CSS 4
- **データベース**: Firestore
- **言語**: TypeScript
- **デプロイ**: Google App Engine

## 開発環境のセットアップ

### 必要な環境

- Node.js 22+
- pnpm
- Google Cloud SDK（本番環境デプロイ時）

### インストール

```bash
# 依存パッケージのインストール
pnpm install
```

### 開発サーバーの起動

```bash
# Next.js 開発サーバーを起動
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### 環境変数の設定

`.env.local` ファイルを作成して環境変数を設定します：

```bash
# .env.example をコピー
cp .env.example .env.local
```

`.env.local` の内容：
```
FIRESTORE_EMULATOR_HOST=localhost:8080
FIRESTORE_PROJECT_ID=archery-log-dev
```

### Firestore エミュレーターの使用

開発環境では Firestore エミュレーターを使用します：

```bash
# Firestore エミュレーターを起動
gcloud beta emulators firestore start
```

別のターミナルで開発サーバーを起動：
```bash
pnpm dev
```

## セキュリティとアクセス制御

### IAP (Identity-Aware Proxy)

本番環境では Google Cloud IAP を使用してユーザー認証を行います。IAP は以下のヘッダーを設定します：

- `X-Goog-Authenticated-User-Email`: ユーザーのメールアドレス
- `X-Goog-Authenticated-User-Id`: ユーザーの一意な ID

開発環境では、これらのヘッダーがない場合、ダミーユーザーが自動的に設定されます。

### データアクセス制御

- すべてのデータアクセスは Server Actions を通じて行われます
- ユーザーは自分のデータのみ読み書きできます
- Firestore Security Rules により、データベースレベルでもアクセス制御を実施
- 各リクエストでユーザー ID が検証され、不正なアクセスは拒否されます

## ビルド

```bash
# 本番用ビルド
pnpm build

# ビルドしたアプリを起動
pnpm start
```

## デプロイ（App Engine）

```bash
# App Engine にデプロイ
gcloud app deploy

# デプロイ後のアプリを確認
gcloud app browse
```

## プロジェクト構造

```
archery-log/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # ホーム画面
│   ├── rounds/              # ラウンド関連
│   │   ├── new/            # 新規ラウンド設定
│   │   │   ├── page.tsx
│   │   │   ├── NewRoundClient.tsx
│   │   │   └── actions.ts
│   │   ├── [id]/           # 記録詳細
│   │   │   ├── page.tsx
│   │   │   ├── RoundDetailClient.tsx
│   │   │   ├── actions.ts
│   │   │   └── score/      # 点数入力
│   │   │       ├── page.tsx
│   │   │       ├── ScoreInputClient.tsx
│   │   │       └── actions.ts
│   │   └── page.tsx        # 記録一覧
│   └── stats/              # 統計画面
│       ├── page.tsx
│       └── StatsClient.tsx
├── components/             # 共通コンポーネント
│   └── Header.tsx         # 共通ヘッダー
├── contexts/              # React Context
│   └── AuthContext.tsx    # 認証コンテキスト
├── lib/                   # Server Actions & ユーティリティ
│   ├── auth.ts           # IAP 認証 (Server Action)
│   ├── actions.ts        # 共通 Server Actions
│   ├── rounds.ts         # Firestore アクセス
│   ├── firestore.ts      # Firestore 設定
│   └── types.ts          # 型定義
├── middleware.ts          # Next.js ミドルウェア（認証チェック）
├── public/               # 静的ファイル
├── app.yaml              # App Engine 設定
├── firestore.rules       # Firestore Security Rules
└── .env.local            # 環境変数（開発用）
```

## データ構造

### Round（ラウンド）

```typescript
interface Round {
  id: string;
  userId: string;
  type: 'standard' | 'custom';
  distance: 30 | 50 | 70 | number;
  endsCount: number;
  arrowsPerEnd: number;
  date: Date;
  location?: string;
  memo?: string;
  totalScore: number;
  averageScore: number;
  ends: End[];
  createdAt: Date;
  updatedAt: Date;
}
```

### End（エンド）

```typescript
interface End {
  endNumber: number;
  scores: Score[];
  total: number;
}
```

### Score（点数）

```typescript
interface Score {
  value: number | 'M' | 'X';
  displayValue: string;
  numericValue: number;
}
```

## アーキテクチャの特徴

### Server Components と Client Components

- **Server Components**: データ取得とページレンダリング
- **Client Components**: インタラクティブな操作のみ
- ページごとに Server Component でデータを取得し、Client Component に渡す設計

### Server Actions

- API Routes を使用せず、すべてのデータ操作を Server Actions で実装
- ページ固有の Actions は各ページディレクトリに配置（凝集性の向上）
- 共通 Actions のみ `lib/actions.ts` に配置

### ミドルウェアによる認証

- すべての保護されたページで認証チェックを一元管理
- 未認証の場合は自動的にホームページにリダイレクト

### 型安全性

- TypeScript による完全な型定義
- `any` 型を使用しない厳格な型チェック
- Firestore とアプリケーション間の型変換を明示的に実装

## ライセンス

MIT

# アーチェリー記録アプリ

アーチェリーの点数を記録・管理する Web アプリケーション

## 機能

- ✅ ユーザー認証（IAP - Identity-Aware Proxy）
- ✅ ユーザー固有のデータアクセス制御
- ✅ ラウンド設定（30m/50m/70m、カスタム）
- ✅ 点数入力（タップで簡単入力）
- ✅ 記録履歴の閲覧
- ✅ 記録詳細の確認
- ✅ 統計データの表示
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

### Firestore エミュレーターの使用

開発環境では Firestore エミュレーターを使用します：

```bash
# Firestore エミュレーターを起動
gcloud beta emulators firestore start

# 環境変数を設定
$(gcloud beta emulators firestore env-init)
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
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ホーム画面
│   ├── rounds/            # ラウンド関連
│   │   ├── new/          # 新規ラウンド設定
│   │   ├── score/        # 点数入力
│   │   ├── [id]/         # 記録詳細
│   │   └── page.tsx      # 記録一覧
│   └── stats/            # 統計画面
├── contexts/             # React Context
│   └── AuthContext.tsx   # 認証コンテキスト
├── lib/                  # Server Actions & ユーティリティ
│   ├── auth.ts          # IAP 認証 (Server Action)
│   ├── actions.ts       # データ操作 (Server Actions)
│   ├── rounds.ts        # Firestore アクセス
│   ├── firestore.ts     # Firestore 設定
│   └── types.ts         # 型定義
├── public/              # 静的ファイル
├── app.yaml             # App Engine 設定
├── firebase.json        # Firebase 設定
└── firestore.rules      # Firestore Security Rules
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
  date: string;
  location?: string;
  memo?: string;
  totalScore: number;
  averageScore: number;
  ends: End[];
  createdAt: string;
  updatedAt: string;
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

## ライセンス

MIT

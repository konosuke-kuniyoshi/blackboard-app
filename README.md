# 黒板アプリ - リアルタイム共有黒板

リアルタイムで複数人が同時に描画できる黒板アプリケーションです。WebSocketを使用して、複数のユーザーがリアルタイムで描画内容を共有できます。

## 機能

- 🎨 **リアルタイム描画共有** - WebSocketによる即座の同期
- 🏫 **複数の部屋** - 部屋ごとに独立した黒板を使用可能
- 🖍️ **チョーク機能** - 6色のチョークから選択可能
- 🧹 **黒板消し** - 描画内容を消去
- 📏 **線の太さ調整** - チョークと黒板消しで独立した太さ設定
- 💾 **永続化** - PostgreSQLに描画データを保存
- 🎯 **カスタムカーソル** - ツールに応じたビジュアルカーソル
- 📱 **レスポンシブデザイン** - 木製の枠で囲まれた黒板UI

## 技術スタック

### フロントエンド
- React 19
- TypeScript
- Vite
- HTML5 Canvas API
- WebSocket Client

### バックエンド
- Node.js
- Express 5
- WebSocket (ws)
- PostgreSQL
- TypeScript

## セットアップ

### 前提条件
- Node.js 18以上
- PostgreSQL 12以上

### データベースのセットアップ

1. PostgreSQLに接続:
```bash
psql -U postgres -h localhost
```

2. データベースとテーブルを作成:
```sql
CREATE DATABASE blackboard_db;
\c blackboard_db
```

3. `create_tables.sql`を実行:
```bash
psql -U postgres -h localhost -d blackboard_db -f create_tables.sql
```

### サーバーのセットアップ

1. サーバーディレクトリに移動:
```bash
cd server
```

2. 依存関係をインストール:
```bash
npm install
```

3. `.env`ファイルを作成:
```env
PORT=3001
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/blackboard_db
NODE_ENV=development
```

4. サーバーを起動:
```bash
npm run dev
```

### クライアントのセットアップ

1. クライアントディレクトリに移動:
```bash
cd client
```

2. 依存関係をインストール:
```bash
npm install
```

3. 開発サーバーを起動:
```bash
npm run dev
```

4. ブラウザで `http://localhost:5173` にアクセス

## 使い方

1. **部屋の選択** - 左側のサイドバーから部屋を選択
2. **描画** - 黒板上でマウスをドラッグして描画
3. **色の変更** - 下部のツールバーから色を選択
4. **ツール切り替え** - チョークと黒板消しを切り替え
5. **太さ調整** - スライダーで線の太さを調整
6. **全消去** - 「全消去」ボタンで黒板をクリア

## プロジェクト構造

```
blackBoard/
├── client/                 # フロントエンド
│   ├── src/
│   │   ├── assets/        # 画像・アイコン
│   │   ├── components/    # Reactコンポーネント
│   │   ├── hooks/         # カスタムフック
│   │   └── types/         # TypeScript型定義
│   └── package.json
├── server/                 # バックエンド
│   ├── src/
│   │   ├── db/            # データベース関連
│   │   ├── types/         # TypeScript型定義
│   │   ├── server.ts      # メインサーバー
│   │   └── websocket.ts   # WebSocketハンドラ
│   └── package.json
└── create_tables.sql       # データベーススキーマ
```

## ライセンス

MIT

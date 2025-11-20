# デプロイガイド

このドキュメントでは、VercelとRenderを使用してアプリケーションをデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント（無料）
- Renderアカウント（無料）

## デプロイ手順

### 1. データベースのデプロイ（Render）

1. [Render Dashboard](https://dashboard.render.com/) にアクセス
2. 「New +」→「PostgreSQL」を選択
3. 設定：
   - **Name**: `blackboard-db`
   - **Database**: `blackboard_db`
   - **User**: 自動生成
   - **Region**: Singapore（最も近いリージョン）
   - **Plan**: Free（または Starter $7/月）
4. 「Create Database」をクリック
5. データベース作成後、「Connect」→「External Connection」から接続情報を取得
6. **Internal Database URL** をコピー（後で使用）

#### データベーステーブルの作成

1. Renderのダッシュボードで、作成したデータベースを選択
2. 「Shell」タブを開く
3. `create_tables.sql`の内容を実行：

```sql
CREATE TABLE IF NOT EXISTS drawing_strokes (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(255) NOT NULL,
    stroke_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_room_id (room_id),
    INDEX idx_created_at (created_at)
);
```

### 2. サーバーのデプロイ（Render）

1. [Render Dashboard](https://dashboard.render.com/) にアクセス
2. 「New +」→「Web Service」を選択
3. GitHubリポジトリを連携：
   - 「Connect a repository」でGitHubを認証
   - `blackboard-app`リポジトリを選択
4. 設定：
   - **Name**: `blackboard-server`
   - **Region**: Singapore
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free（または Starter $7/月）

5. 環境変数を設定（「Environment」タブ）：
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<手順1で取得したInternal Database URL>
   CLIENT_URL=https://your-app.vercel.app
   ```
   ※ CLIENT_URLは後で更新します

6. 「Create Web Service」をクリック

7. デプロイ完了後、サーバーのURLをコピー（例: `https://blackboard-server.onrender.com`）

### 3. クライアントのデプロイ（Vercel）

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. 「Add New...」→「Project」を選択
3. GitHubリポジトリをインポート：
   - `blackboard-app`リポジトリを選択
4. 設定：
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`（自動検出）
   - **Output Directory**: `dist`（自動検出）

5. 環境変数を設定：
   ```
   VITE_WS_URL=wss://blackboard-server.onrender.com
   VITE_API_URL=https://blackboard-server.onrender.com
   ```
   ※ `ws://` → `wss://`（HTTPS対応）に注意

6. 「Deploy」をクリック

7. デプロイ完了後、Vercel URLをコピー（例: `https://blackboard-app.vercel.app`）

### 4. サーバーの環境変数を更新

1. Renderのダッシュボードに戻る
2. サーバーの設定を開く
3. 環境変数 `CLIENT_URL` を更新：
   ```
   CLIENT_URL=https://blackboard-app.vercel.app
   ```
   （手順3で取得したVercel URLを使用）

4. 「Save Changes」をクリック
5. サーバーが自動的に再デプロイされます

## デプロイ完了

✅ クライアント: `https://blackboard-app.vercel.app`
✅ サーバー: `https://blackboard-server.onrender.com`
✅ データベース: Render PostgreSQL

アプリケーションにアクセスして、動作を確認してください！

## トラブルシューティング

### WebSocket接続エラー

- サーバーのログを確認（Render Dashboard → Logs）
- 環境変数が正しく設定されているか確認
- `wss://`（SSLあり）を使用しているか確認

### データベース接続エラー

- `DATABASE_URL`が正しく設定されているか確認
- Renderのデータベースが起動しているか確認
- テーブルが作成されているか確認

### CORSエラー

- サーバーの`CLIENT_URL`環境変数が正しいか確認
- クライアントのURLが正確に設定されているか確認

## 更新のデプロイ

コードを更新した場合：

```bash
git add .
git commit -m "更新内容"
git push
```

- Vercel: 自動的に再デプロイされます
- Render: 自動的に再デプロイされます

## コスト

### 無料プラン
- Vercel: 無料（個人利用）
- Render: 無料（制限あり、14日後にデータベースが削除される可能性）

### 有料プラン（推奨）
- Render Web Service: $7/月
- Render PostgreSQL: $7/月
- 合計: $14/月

## 独自ドメインの設定（オプション）

1. ドメインを取得（Google Domains、Namecheap等）
2. Vercelで独自ドメインを設定
3. サーバーの`CLIENT_URL`を独自ドメインに更新

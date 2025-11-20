import { Pool } from 'pg';
import dotenv from 'dotenv';

// .envファイルから環境変数を読み込む
dotenv.config();

// PostgreSQLデータベースへの接続プールを作成
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,     // 接続文字列
    max: 20,                                        // 最大20個の接続を保持
    idleTimeoutMillis: 30000,                       // 30秒使わない接続は閉じる
    connectionTimeoutMillis: 10000,                 // 接続タイムアウト10秒
    ssl: {
        rejectUnauthorized: false                   // 自己署名証明書を許可
    }
})

// SQLを実行する関数
// 使い方: query('SELECT * FROM users WHERE id = $1', [123])
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
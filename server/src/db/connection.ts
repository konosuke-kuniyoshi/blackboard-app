import { Pool } from 'pg';
import dotenv from 'dotenv';

// .envファイルから環墁E��数を読み込む
dotenv.config();

// PostgreSQLチE�Eタベ�Eスへの接続�Eールを作�E
// ローカル環墁E��はSSLなし、本番環墁E��Eender�E�ではSSLあり
const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,     // 接続文字�E
    max: 20,                                        // 最大20個�E接続を保持
    idleTimeoutMillis: 30000,                       // 30秒使わなぁE��続�E閉じめE
    connectionTimeoutMillis: 10000,                 // 接続タイムアウチE0私E
    ssl: isProduction ? {
        rejectUnauthorized: false                   // 本番環墁E 自己署名証明書を許可
    } : false                                        // ローカル環墁E SSLなぁE
})

// SQLを実行する関数
// 使ぁE��: query('SELECT * FROM users WHERE id = $1', [123])
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

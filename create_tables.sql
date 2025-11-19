-- 黒板アプリ用のテーブル作成スクリプト

-- ストローク（線）データを保存するテーブル
CREATE TABLE IF NOT EXISTS drawing_strokes (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(100) NOT NULL,
    stroke_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_strokes_room_id ON drawing_strokes(room_id);
CREATE INDEX IF NOT EXISTS idx_strokes_created_at ON drawing_strokes(created_at);

-- テーブル確認
\dt

-- サンプルデータの確認（空のはず）
SELECT COUNT(*) as total_strokes FROM drawing_strokes;

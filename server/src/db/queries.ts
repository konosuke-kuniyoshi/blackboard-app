import { query } from './connection';
import { DrawingStroke, DBDrawingStroke } from '../types/drawing';

/**
 * ストローク（線）をデータベースに保存
 * @param stroke 保存するストロークデータ
 */
export const saveStroke = async (stroke: DrawingStroke): Promise<void> => {
  const sql = `
    INSERT INTO drawing_strokes (room_id, stroke_data)
    VALUES ($1, $2)
  `;
  // $1 = stroke.roomId, $2 = JSON.stringify(stroke)
  await query(sql, [stroke.roomId, JSON.stringify(stroke)]);
};

/**
 * 特定の部屋のストロークを全て読み込む
 * @param roomId 部屋のID
 * @returns ストロークの配列
 */
export const loadStrokes = async (roomId: string): Promise<DrawingStroke[]> => {
  const sql = `
    SELECT stroke_data
    FROM drawing_strokes
    WHERE room_id = $1
    ORDER BY created_at ASC
  `;
  // $1 = roomId
  const result = await query(sql, [roomId]);
  
  // 結果をDrawingStroke[]に変換して返す
  return result.rows.map((row: any) => row.stroke_data);
};

/**
 * 特定の部屋のストロークを全て削除
 * @param roomId 部屋のID
 */
export const clearRoomStrokes = async (roomId: string): Promise<void> => {
  const sql = `
    DELETE FROM drawing_strokes
    WHERE room_id = $1
  `;
  await query(sql, [roomId]);
};

/**
 * 古いストロークを削除（クリーンアップ用）
 * @param daysToKeep 保持する日数（デフォルト30日）
 */
export const deleteOldStrokes = async (daysToKeep: number = 30): Promise<void> => {
  const sql = `
    DELETE FROM drawing_strokes
    WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
  `;
  await query(sql);
};
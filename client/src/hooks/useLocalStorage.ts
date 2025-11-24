import { useState, useEffect } from 'react';
import type { DrawingStroke } from '../types/drawing';

/**
 * ローカルストレージで描画データを管理するカスタムフック
 * 自習室用の個人専用黒板として使用
 */
export const useLocalStorage = (roomId: string) => {
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const storageKey = `blackboard-${roomId}`;

  // 初期化: ローカルストレージから読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedStrokes = JSON.parse(saved);
        setStrokes(parsedStrokes);
        console.log(`📂 Loaded ${parsedStrokes.length} strokes from localStorage`);
      } else {
        setStrokes([]);
      }
    } catch (error) {
      console.error('❌ Failed to load from localStorage:', error);
      setStrokes([]);
    }
  }, [roomId, storageKey]);

  // ストロークを追加してローカルストレージに保存
  const sendStroke = (stroke: DrawingStroke) => {
    const newStrokes = [...strokes, stroke];
    setStrokes(newStrokes);
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(newStrokes));
      console.log('💾 Saved to localStorage');
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error);
    }
  };

  // 黒板をクリアしてローカルストレージも削除
  const clearBoard = () => {
    setStrokes([]);
    try {
      localStorage.removeItem(storageKey);
      console.log('🗑️ Cleared localStorage');
    } catch (error) {
      console.error('❌ Failed to clear localStorage:', error);
    }
  };

  return {
    strokes,
    isConnected: true, // ローカルなので常に接続状態として扱う
    sendStroke,
    clearBoard,
  };
};

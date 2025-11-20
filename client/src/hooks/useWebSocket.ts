import { useEffect, useRef, useState } from 'react';
import type { WebSocketMessage, DrawingStroke } from '../types/drawing';

/**
 * WebSocket接続を管理するカスタムフック
 * @param roomId 接続する部屋のID
 * @returns ストロークの配列、接続状態、送信関数など
 */
export const useWebSocket = (roomId: string) => {
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // WebSocket接続を確立
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    console.log('Connecting to WebSocket server:', wsUrl);
    ws.current = new WebSocket(wsUrl);

    // 接続が開いた時
    ws.current.onopen = () => {
      console.log('✅ Connected to WebSocket');
      setIsConnected(true);
      
      // ルームに参加
      if (ws.current?.readyState === WebSocket.OPEN) {
        const joinMessage: WebSocketMessage = {
          type: 'join',
          roomId: roomId
        };
        ws.current.send(JSON.stringify(joinMessage));
        console.log(`📍 Joined room: ${roomId}`);
      }
    };

    // メッセージを受信した時
    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('📨 Received message:', message.type);

        switch (message.type) {
          case 'load':
            // 既存データの読み込み
            const loadedStrokes = message.data as DrawingStroke[];
            setStrokes(loadedStrokes);
            console.log(`📥 Loaded ${loadedStrokes.length} strokes`);
            break;

          case 'draw':
            // 新しいストロークを追加
            if (message.data) {
              const newStroke = message.data as DrawingStroke;
              setStrokes((prev) => [...prev, newStroke]);
              console.log('✏️ New stroke added');
            }
            break;

          case 'clear':
            // 全クリア
            setStrokes([]);
            console.log('🗑️ Board cleared');
            break;
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    // 接続が閉じた時
    ws.current.onclose = () => {
      console.log('❌ Disconnected from WebSocket');
      setIsConnected(false);
    };

    // エラーが発生した時
    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // クリーンアップ（コンポーネントがアンマウントされた時）
    return () => {
      console.log('Closing WebSocket connection...');
      ws.current?.close();
    };
  }, [roomId]);

  /**
   * 新しいストロークをサーバーに送信
   * @param stroke 送信するストロークデータ
   */
  const sendStroke = (stroke: DrawingStroke) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'draw',
        roomId: roomId,
        data: stroke
      };
      ws.current.send(JSON.stringify(message));
      console.log('📤 Stroke sent');
    } else {
      console.warn('⚠️ WebSocket is not connected');
    }
  };

  /**
   * 黒板をクリア
   */
  const clearBoard = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'clear',
        roomId: roomId
      };
      ws.current.send(JSON.stringify(message));
      console.log('🗑️ Clear message sent');
    } else {
      console.warn('⚠️ WebSocket is not connected');
    }
  };

  return { strokes, isConnected, sendStroke, clearBoard };
};

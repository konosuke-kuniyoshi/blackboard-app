import { WebSocket, WebSocketServer } from 'ws';
import { WebSocketMessage, DrawingStroke } from './types/drawing';
import { saveStroke, loadStrokes, clearRoomStrokes } from './db/queries';

// WebSocketを拡張して、カスタムプロパティを追加
interface ExtendedWebSocket extends WebSocket {
  roomId?: string;    // このクライアントが参加している部屋ID
  isAlive?: boolean;  // 接続が生きているか（ハートビート用）
}

/**
 * WebSocketサーバーのセットアップ
 * @param wss WebSocketサーバーインスタンス
 */
export const setupWebSocket = (wss: WebSocketServer) => {
  // ルームごとにクライアントを管理するMap
  // キー: roomId, 値: そのルームに接続中のWebSocketのSet
  const rooms = new Map<string, Set<ExtendedWebSocket>>();

  // ハートビート（接続確認）を30秒ごとに実行
  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
      const extWs = ws as ExtendedWebSocket;
      
      // 前回のpingに応答がなければ接続を切断
      if (extWs.isAlive === false) {
        return extWs.terminate();
      }
      
      // 応答フラグをfalseにしてpingを送信
      extWs.isAlive = false;
      extWs.ping();
    });
  }, 30000);

  // WebSocketサーバーが閉じられたら、ハートビートを停止
  wss.on('close', () => {
    clearInterval(interval);
  });

  // 新しいクライアントが接続した時の処理
  wss.on('connection', (ws: ExtendedWebSocket) => {
    console.log('New client connected');
    ws.isAlive = true;

    // pongメッセージを受信したら、接続が生きていることを記録
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // クライアントからメッセージを受信した時の処理
    ws.on('message', async (data: string) => {
      try {
        // JSONをパース
        const message: WebSocketMessage = JSON.parse(data.toString());

        // メッセージタイプごとに処理を分岐
        switch (message.type) {
          case 'join':
            // ルームに参加
            ws.roomId = message.roomId;
            
            // ルームが存在しなければ作成
            if (!rooms.has(message.roomId)) {
              rooms.set(message.roomId, new Set());
            }
            rooms.get(message.roomId)!.add(ws);

            console.log(`Client joined room: ${message.roomId}`);

            // データベースから既存の描画データを読み込んで送信
            const strokes = await loadStrokes(message.roomId);
            ws.send(JSON.stringify({
              type: 'load',
              roomId: message.roomId,
              data: strokes
            }));
            break;

          case 'draw':
            // 新しい線が描かれた
            if (message.data && ws.roomId) {
              const stroke = message.data as DrawingStroke;
              
              // データベースに保存
              await saveStroke(stroke);
              console.log(`Stroke saved to room: ${ws.roomId}`);

              // 同じルームの全クライアントに配信
              const roomClients = rooms.get(ws.roomId);
              if (roomClients) {
                roomClients.forEach((client) => {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                  }
                });
              }
            }
            break;

          case 'clear':
            // 黒板をクリア
            if (ws.roomId) {
              // データベースから削除
              await clearRoomStrokes(ws.roomId);
              console.log(`Room cleared: ${ws.roomId}`);

              // 同じルームの全クライアントに配信
              const roomClients = rooms.get(ws.roomId);
              if (roomClients) {
                roomClients.forEach((client) => {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                  }
                });
              }
            }
            break;
        }
      } catch (error) {
        console.error('Error handling message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Invalid message format' }
        }));
      }
    });

    // クライアントが切断した時の処理
    ws.on('close', () => {
      console.log('Client disconnected');
      
      // ルームから削除
      if (ws.roomId && rooms.has(ws.roomId)) {
        rooms.get(ws.roomId)!.delete(ws);
        
        // ルームが空になったら削除
        if (rooms.get(ws.roomId)!.size === 0) {
          rooms.delete(ws.roomId);
          console.log(`Room deleted: ${ws.roomId}`);
        }
      }
    });

    // エラーが発生した時の処理
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('WebSocket server is ready');
};
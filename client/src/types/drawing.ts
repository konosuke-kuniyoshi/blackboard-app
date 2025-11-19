// 座標を表す型
export interface Point {
  x: number;
  y: number;
}

// 黒板に描いた1本の線（ストローク）を表す型
export interface DrawingStroke {
  id: string;              // ストロークの一意なID
  roomId: string;          // どの部屋の黒板か
  points: Point[];         // 線を構成する座標の配列
  color: string;           // 線の色（例: "#ffffff"）
  lineWidth: number;       // 線の太さ
  tool: 'pen' | 'eraser';  // ペンか消しゴムか
  timestamp: number;       // 描いた時刻（ミリ秒）
}

// WebSocketで送受信するメッセージの型
export interface WebSocketMessage {
  type: 'draw' | 'clear' | 'load' | 'join';  // メッセージの種類
  roomId: string;                             // 対象の部屋ID
  data?: DrawingStroke | DrawingStroke[];     // データ（種類による）
}

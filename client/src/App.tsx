import { useState } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { Navbar } from './components/Navbar';
import { useWebSocket } from './hooks/useWebSocket';
import './App.css';

function App() {
  // 部屋IDの状態管理
  const [roomId, setRoomId] = useState('room-1');
  
  // WebSocket接続とストローク管理
  const { strokes, isConnected, sendStroke, clearBoard } = useWebSocket(roomId);

  // ツールの状態管理
  const [color, setColor] = useState('#ffffff');      // デフォルトは白
  const [penWidth, setPenWidth] = useState(6);        // ペンの太さ
  const [eraserWidth, setEraserWidth] = useState(50); // 消しゴムの太さ
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');  // デフォルトはペン

  // 現在のツールに応じた太さを取得
  const currentLineWidth = tool === 'pen' ? penWidth : eraserWidth;

  // 太さを設定（現在のツールに応じて）
  const setCurrentLineWidth = (width: number) => {
    if (tool === 'pen') {
      setPenWidth(width);
    } else {
      setEraserWidth(width);
    }
  };

  // 部屋を変更する処理
  const handleRoomChange = (newRoomId: string) => {
    setRoomId(newRoomId);
  };

  return (
    <div className="App">
      <Navbar currentRoom={roomId} onRoomChange={handleRoomChange} />
      <div className="main-content">
        <Toolbar
          color={color}
          setColor={setColor}
          lineWidth={currentLineWidth}
          setLineWidth={setCurrentLineWidth}
          tool={tool}
          setTool={setTool}
          onClear={clearBoard}
          isConnected={isConnected}
        />
        <div className="canvas-container">
          <Canvas
            strokes={strokes}
            onStrokeComplete={sendStroke}
            color={color}
            lineWidth={currentLineWidth}
            tool={tool}
            roomId={roomId}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

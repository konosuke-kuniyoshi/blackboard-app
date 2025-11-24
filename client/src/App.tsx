import { useState } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { Navbar } from './components/Navbar';
import { useWebSocket } from './hooks/useWebSocket';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useUIState } from './hooks/useUIState';
import './App.css';

function App() {
  // 部屋IDの状態管理
  const [roomId, setRoomId] = useState('room-1');
  
  // UIの状態管理（ローカルストレージに永続化）
  const { uiState, updateUIState, addCustomColor, removeCustomColor, updateCustomColor } = useUIState();
  
  // 自習室かどうかを判定
  const isStudyRoom = roomId === 'study';
  
  // WebSocket接続とストローク管理（共有部屋用）
  const webSocketData = useWebSocket(roomId);
  
  // ローカルストレージ管理（自習室用）
  const localStorageData = useLocalStorage(roomId);
  
  // 自習室の場合はローカルストレージ、それ以外はWebSocketを使用
  const { strokes, isConnected, sendStroke, clearBoard } = isStudyRoom 
    ? localStorageData 
    : webSocketData;

  // 現在のツールに応じた太さを取得
  const currentLineWidth = uiState.selectedTool === 'pen' ? uiState.penWidth : uiState.eraserWidth;

  // 太さを設定（現在のツールに応じて）
  const setCurrentLineWidth = (width: number) => {
    if (uiState.selectedTool === 'pen') {
      updateUIState({ penWidth: width });
    } else {
      updateUIState({ eraserWidth: width });
    }
  };

  // 色を設定
  const setColor = (color: string) => {
    updateUIState({ penColor: color });
  };

  // ツールを設定
  const setTool = (tool: 'pen' | 'eraser') => {
    updateUIState({ selectedTool: tool });
  };

  // 部屋を変更する処理
  const handleRoomChange = (newRoomId: string) => {
    setRoomId(newRoomId);
  };

  // ナビゲーションバーの開閉状態を切り替え
  const toggleNavbar = (isCollapsed: boolean) => {
    updateUIState({ isNavbarCollapsed: isCollapsed });
  };

  return (
    <div className="App">
      <Navbar 
        currentRoom={roomId} 
        onRoomChange={handleRoomChange}
        isCollapsed={uiState.isNavbarCollapsed}
        onToggleCollapse={toggleNavbar}
      />
      <div className="main-content">
        <Toolbar
          color={uiState.penColor}
          setColor={setColor}
          lineWidth={currentLineWidth}
          setLineWidth={setCurrentLineWidth}
          tool={uiState.selectedTool}
          setTool={setTool}
          onClear={clearBoard}
          isConnected={isConnected}
          customColors={uiState.customColors}
          onAddCustomColor={addCustomColor}
          onRemoveCustomColor={removeCustomColor}
          onUpdateCustomColor={updateCustomColor}
        />
        <div className="canvas-container">
          <Canvas
            strokes={strokes}
            onStrokeComplete={sendStroke}
            color={uiState.penColor}
            lineWidth={currentLineWidth}
            tool={uiState.selectedTool}
            roomId={roomId}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

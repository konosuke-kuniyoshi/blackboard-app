import React from 'react';
import './Toolbar.css';

interface ToolbarProps {
  color: string;
  setColor: (color: string) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  tool: 'pen' | 'eraser';
  setTool: (tool: 'pen' | 'eraser') => void;
  onClear: () => void;
  isConnected: boolean;
}

/**
 * チョークのSVGアイコン
 */
const ChalkIcon: React.FC<{ color: string; isActive: boolean }> = ({ color, isActive }) => (
  <svg width="38" height="38" viewBox="0 0 38 38" style={{ display: 'block' }}>
    <g transform="rotate(-30 19 19)">
      {/* チョークの本体（細長い） */}
      <rect 
        x="14" 
        y="4" 
        width="7" 
        height="28" 
        rx="1.5" 
        fill={color}
        stroke={isActive ? '#FFD700' : 'none'}
        strokeWidth={isActive ? '2.5' : '0'}
      />
      {/* チョークの先端（斜めカット） */}
      <path 
        d="M 14 32 L 15.5 36 L 19.5 36 L 21 32 Z" 
        fill={color}
        stroke={isActive ? '#FFD700' : 'none'}
        strokeWidth={isActive ? '2.5' : '0'}
        opacity="0.9"
      />
      {/* ハイライト */}
      <rect 
        x="16" 
        y="6" 
        width="2" 
        height="24" 
        rx="0.5" 
        fill="white" 
        opacity="0.5" 
      />
      {/* 影 */}
      <rect 
        x="19" 
        y="6" 
        width="1.5" 
        height="24" 
        rx="0.5" 
        fill="black" 
        opacity="0.2" 
      />
    </g>
  </svg>
);

/**
 * 黒板消しのSVGアイコン
 */
const EraserIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg width="55" height="40" viewBox="0 0 55 40" style={{ display: 'block' }}>
    {/* 持ち手（黒） */}
    <rect 
      x="22" 
      y="8" 
      width="10" 
      height="7" 
      rx="1" 
      fill="#2C2C2C"
      stroke={isActive ? '#FFD700' : 'none'}
      strokeWidth={isActive ? '2' : '0'}
    />
    {/* 本体上部（オレンジ） */}
    <rect 
      x="8" 
      y="15" 
      width="38" 
      height="8" 
      rx="1.5" 
      fill="#FF8C42"
      stroke={isActive ? '#FFD700' : 'none'}
      strokeWidth={isActive ? '2.5' : '0'}
    />
    {/* 本体下部（深緑） */}
    <rect 
      x="8" 
      y="23" 
      width="38" 
      height="9" 
      rx="1.5" 
      fill="#0d5c4d"
      stroke={isActive ? '#FFD700' : 'none'}
      strokeWidth={isActive ? '2.5' : '0'}
    />
    {/* 境界線 */}
    <line 
      x1="8" 
      y1="23" 
      x2="46" 
      y2="23" 
      stroke="#0a463b" 
      strokeWidth="1.5"
    />
    {/* 使用感のある白い跡（フェルト部分） */}
    <ellipse cx="16" cy="27" rx="3" ry="2" fill="white" opacity="0.6" />
    <ellipse cx="24" cy="26" rx="4" ry="2.5" fill="white" opacity="0.7" />
    <ellipse cx="32" cy="27" rx="3.5" ry="2" fill="white" opacity="0.65" />
    <ellipse cx="39" cy="27" rx="3" ry="2" fill="white" opacity="0.6" />
  </svg>
);

/**
 * ツールバーコンポーネント
 */
export const Toolbar: React.FC<ToolbarProps> = ({
  color,
  setColor,
  lineWidth,
  setLineWidth,
  tool,
  setTool,
  onClear,
  isConnected
}) => {
  // チョークの色の選択肢
  const colors = [
    '#ffffff', // 白
    '#ffff00', // 黄色
    '#ff6b6b', // 赤
    '#4ecdc4', // シアン
    '#45b7d1', // 青
    '#ffa07a'  // オレンジ
  ];

  return (
    <div className="toolbar">
      {/* 接続状態 */}
      <div style={styles.section}>
        <span style={styles.label}>接続: </span>
        <span style={{ 
          ...styles.status, 
          color: isConnected ? '#4ecdc4' : '#ff6b6b' 
        }}>
          {isConnected ? '●' : '○'}
        </span>
      </div>

      {/* ツール選択 */}
      <div style={styles.section}>
        <button
          onClick={() => setTool('pen')}
          style={{
            ...styles.toolButton,
            ...(tool === 'pen' ? styles.activeToolButton : { borderColor: '#d4a574' }),
            outline: 'none'
          }}
          title="ペン"
          onFocus={(e) => e.currentTarget.style.outline = 'none'}
        >
          <ChalkIcon color={color} isActive={tool === 'pen'} />
        </button>
        <button
          onClick={() => setTool('eraser')}
          style={{
            ...styles.toolButton,
            ...(tool === 'eraser' ? styles.activeToolButton : { borderColor: '#d4a574' }),
            outline: 'none'
          }}
          title="黒板消し"
          onFocus={(e) => e.currentTarget.style.outline = 'none'}
        >
          <EraserIcon isActive={tool === 'eraser'} />
        </button>
      </div>

      {/* 色選択（チョークの形） */}
      <div style={styles.section}>
        <span style={styles.label}>チョーク: </span>
        <div style={styles.chalkContainer}>
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                ...styles.chalkButton,
                border: 'none',
                background: 'transparent',
                padding: 0
              }}
              title={c}
            >
              <ChalkIcon color={c} isActive={color === c} />
            </button>
          ))}
        </div>
      </div>

      {/* 太さ調整（ツールに応じて表示を変更） */}
      <div style={styles.section}>
        <span style={styles.label}>
          {tool === 'pen' ? 'チョークの太さ:' : '消しゴムの太さ:'}
        </span>
        <input
          type="range"
          min="1"
          max={tool === 'pen' ? 20 : 100}
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          style={styles.slider}
        />
        <span style={styles.label}>{lineWidth}px</span>
      </div>

      {/* クリアボタン */}
      <button 
        onClick={onClear} 
        style={{ ...styles.button, ...styles.clearButton }}
      >
        🗑️ 全消去
      </button>
    </div>
  );
};

// スタイル定義
const styles: { [key: string]: React.CSSProperties } = {
  section: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    color: '#333'
  },
  status: {
    fontWeight: 'bold',
    fontSize: '18px'
  },
  toolButton: {
    padding: '5px',
    backgroundColor: 'transparent',
    border: '2px solid #d4a574',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none'
  },
  activeToolButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: '#FFD700',
    outline: 'none'
  },
  chalkContainer: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center'
  },
  chalkButton: {
    cursor: 'pointer',
    transition: 'transform 0.2s',
    padding: 0,
    border: 'none',
    background: 'transparent'
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#8B4513',
    color: '#fff',
    border: '2px solid #6B3410',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    fontWeight: 'bold'
  },
  slider: {
    width: '120px',
    cursor: 'pointer',
    accentColor: '#8B4513'
  },
  clearButton: {
    backgroundColor: '#8B4513',
    marginLeft: 'auto',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
  }
};

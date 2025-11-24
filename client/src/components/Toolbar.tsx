import React, { useState } from 'react';
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
  customColors: string[];
  onAddCustomColor: (color: string) => void;
  onRemoveCustomColor: (color: string) => void;
  onUpdateCustomColor: (oldColor: string, newColor: string) => void;
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
  isConnected,
  customColors,
  onAddCustomColor,
  onRemoveCustomColor,
  onUpdateCustomColor
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingColor, setEditingColor] = useState<string | null>(null);
  const [tempColor, setTempColor] = useState<string>('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  // 画面サイズと向きの変化を監視
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      const portrait = window.innerHeight > window.innerWidth;
      console.log('Toolbar resize:', { width: window.innerWidth, isMobile: mobile, isPortrait: portrait });
      setIsMobile(mobile);
      setIsPortrait(portrait);
    };
    // 初回実行
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 外側クリックでダイアログを閉じる
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // カラーピッカーダイアログ内のクリックは無視
      if (target.closest('.color-picker-dialog') || target.closest('.color-edit-dialog')) {
        return;
      }
      setShowColorPicker(false);
      setEditingColor(null);
    };

    if (showColorPicker || editingColor) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showColorPicker, editingColor]);

  // レスポンシブなスタイル
  const responsiveStyles = {
    section: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '3px' : '10px' // モバイルでは狭く
    },
    chalkContainer: {
      display: 'flex',
      gap: isMobile ? '3px' : '5px', // モバイルでは狭く
      alignItems: 'center'
    }
  };

  return (
    <div className="toolbar">
      {/* 接続状態 */}
      <div style={responsiveStyles.section}>
        <span style={styles.label}>接続: </span>
        <span style={{ 
          ...styles.status, 
          color: isConnected ? '#4ecdc4' : '#ff6b6b' 
        }}>
          {isConnected ? '●' : '○'}
        </span>
      </div>

      {/* ツール選択 */}
      <div style={responsiveStyles.section}>
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

      {/* 改行可能ポイント */}
      <wbr />

      {/* 色選択（チョークの形） */}
      <div style={responsiveStyles.section}>
        <span style={styles.label}>チョーク: </span>
        <div style={responsiveStyles.chalkContainer}>
          {customColors.map((c) => (
            <div key={c} style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={() => setColor(c)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  // 白色は編集不可
                  if (c === '#ffffff') return;
                  setShowColorPicker(false); // 追加ダイアログを閉じる
                  setEditingColor(c);
                  setTempColor(c);
                }}
                onTouchStart={() => {
                  // 白色は編集不可
                  if (c === '#ffffff') return;
                  // 長押し開始
                  const timer = setTimeout(() => {
                    setShowColorPicker(false); // 追加ダイアログを閉じる
                    setEditingColor(c);
                    setTempColor(c);
                  }, 500); // 500ms長押しで編集モード
                  setLongPressTimer(timer);
                }}
                onTouchEnd={() => {
                  // 長押しタイマーをクリア
                  if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    setLongPressTimer(null);
                  }
                }}
                onTouchMove={() => {
                  // 指が動いたらタイマーをクリア
                  if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    setLongPressTimer(null);
                  }
                }}
                style={{
                  ...styles.chalkButton,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  WebkitTouchCallout: 'none'
                }}
                title={c === '#ffffff' ? `${c}` : `${c} (長押しまたは右クリックで編集)`}
              >
                <ChalkIcon color={c} isActive={color === c} />
              </button>
              {editingColor === c && c !== '#ffffff' && (
                <div 
                  className="color-edit-dialog"
                  style={{
                    position: 'fixed',
                    top: isPortrait ? '10vh' : '50%',
                    left: '50%',
                    transform: isPortrait ? 'translateX(-50%)' : 'translate(-50%, -50%)',
                    zIndex: 10000,
                    background: '#fff',
                    border: '2px solid #8B7355',
                    borderRadius: '4px',
                    padding: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    minWidth: '200px',
                    maxWidth: '90vw',
                    maxHeight: isPortrait ? '70vh' : '80vh',
                    overflowY: 'auto',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    WebkitTouchCallout: 'none'
                  }}
                >
                  <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>色を編集</div>
                  <input
                    type="color"
                    value={tempColor}
                    onChange={(e) => setTempColor(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      border: '1px solid #8B7355',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginBottom: '8px'
                    }}
                  />
                  {/* カラーパレット */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>よく使う色:</div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(6, 1fr)', 
                      gap: '4px' 
                    }}>
                      {[
                        '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
                        '#ff00ff', '#00ffff', '#ff8800', '#88ff00', '#0088ff', '#ff0088',
                        '#ffc0cb', '#ffa500', '#ffffe0', '#90ee90', '#add8e6', '#dda0dd',
                        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'
                      ].map((paletteColor) => (
                        <button
                          key={paletteColor}
                          onClick={() => setTempColor(paletteColor)}
                          style={{
                            width: '26px',
                            height: '26px',
                            border: tempColor === paletteColor ? '2px solid #333' : '1px solid #ccc',
                            borderRadius: '4px',
                            background: paletteColor,
                            cursor: 'pointer',
                            padding: 0,
                            boxShadow: paletteColor === '#ffffff' ? 'inset 0 0 0 1px #e0e0e0' : 'none'
                          }}
                          title={paletteColor}
                        />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                    <button
                      onClick={() => {
                        onUpdateCustomColor(c, tempColor);
                        setColor(tempColor);
                        setEditingColor(null);
                      }}
                      style={{
                        flex: 1,
                        padding: '6px',
                        background: '#4ecdc4',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      更新
                    </button>
                    <button
                      onClick={() => {
                        // 削除時に選択中の色だった場合は白色に変更
                        if (color === c) {
                          setColor('#ffffff');
                        }
                        onRemoveCustomColor(c);
                        setEditingColor(null);
                      }}
                      style={{
                        flex: 1,
                        padding: '6px',
                        background: '#ff6b6b',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      削除
                    </button>
                  </div>
                  <button
                    onClick={() => setEditingColor(null)}
                    style={{
                      width: '100%',
                      padding: '4px',
                      background: '#8B7355',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    閉じる
                  </button>
                </div>
              )}
            </div>
          ))}
          {/* カスタムカラー追加ボタン */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setEditingColor(null); // 編集ダイアログを閉じる
                setShowColorPicker(!showColorPicker);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
              }}
              style={{
                ...styles.chalkButton,
                width: '23px',
                height: '23px',
                border: '2px solid #8B7355',
                borderRadius: '50%',
                background: '#ffffff',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#000000',
                transition: 'background 0.2s ease',
                padding: 0,
                lineHeight: '1'
              }}
              title="カスタムカラーを追加"
            >
              +
            </button>
            {showColorPicker && (
              <div 
                className="color-picker-dialog"
                style={{
                  position: 'fixed',
                  top: isPortrait ? '10vh' : '50%',
                  left: '50%',
                  transform: isPortrait ? 'translateX(-50%)' : 'translate(-50%, -50%)',
                  zIndex: 10000,
                  background: '#fff',
                  border: '2px solid #8B7355',
                  borderRadius: '4px',
                  padding: '10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  minWidth: '200px',
                  maxWidth: '90vw',
                  maxHeight: isPortrait ? '70vh' : '80vh',
                  overflowY: 'auto',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  WebkitTouchCallout: 'none'
                }}
              >
                <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>色を追加</div>
                <input
                  type="color"
                  value={tempColor || color}
                  onChange={(e) => setTempColor(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #8B7355',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginBottom: '8px'
                  }}
                />
                {/* カラーパレット */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>よく使う色:</div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(6, 1fr)', 
                    gap: '4px' 
                  }}>
                    {[
                      '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
                      '#ff00ff', '#00ffff', '#ff8800', '#88ff00', '#0088ff', '#ff0088',
                      '#ffc0cb', '#ffa500', '#ffffe0', '#90ee90', '#add8e6', '#dda0dd',
                      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'
                    ].map((paletteColor) => (
                      <button
                        key={paletteColor}
                        onClick={() => setTempColor(paletteColor)}
                        style={{
                          width: '26px',
                          height: '26px',
                          border: tempColor === paletteColor ? '2px solid #333' : '1px solid #ccc',
                          borderRadius: '4px',
                          background: paletteColor,
                          cursor: 'pointer',
                          padding: 0,
                          boxShadow: paletteColor === '#ffffff' ? 'inset 0 0 0 1px #e0e0e0' : 'none'
                        }}
                        title={paletteColor}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newColor = tempColor || color;
                    onAddCustomColor(newColor);
                    setColor(newColor);
                    setShowColorPicker(false);
                    setTempColor('');
                  }}
                  style={{
                    width: '100%',
                    padding: '6px',
                    background: '#4ecdc4',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '5px'
                  }}
                >
                  追加
                </button>
                <button
                  onClick={() => {
                    setShowColorPicker(false);
                    setTempColor('');
                  }}
                  style={{
                    width: '100%',
                    padding: '4px',
                    background: '#8B7355',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  閉じる
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 太さ調整（ツールに応じて表示を変更） */}
      <div style={responsiveStyles.section}>
        <span style={styles.label}>
          {tool === 'pen' ? 'チョークの太さ:' : '黒板消しの太さ:'}
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

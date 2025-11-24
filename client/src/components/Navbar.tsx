import React from 'react';
import blackboardIcon from '../assets/blackboard.svg';
import { AdSense } from './AdSense';
import './Navbar.css';

interface NavbarProps {
  currentRoom: string;
  onRoomChange: (roomId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: (isCollapsed: boolean) => void;
}

/**
 * サイドバー形式のナビゲーションバーコンポーネント
 */
export const Navbar: React.FC<NavbarProps> = ({ currentRoom, onRoomChange, isCollapsed, onToggleCollapse }) => {

  // よく使う部屋のリスト
  const rooms = [
    { id: 'room-1', name: '教室1', icon: '🏫', description: '共有黒板' },
    { id: 'room-2', name: '教室2', icon: '📚', description: '共有黒板' },
    { id: 'room-3', name: '教室3', icon: '✏️', description: '共有黒板' },
    { id: 'study', name: '自習室', icon: '📖', description: '個人専用（ローカル保存）' }
  ];

  return (
    <nav 
      className={`navbar ${isCollapsed ? 'collapsed' : 'expanded'}`}
      style={{ width: isCollapsed ? '60px' : '200px' }}
    >
      {/* ヘッダー */}
      <div style={{
        ...styles.header,
        justifyContent: isCollapsed ? 'center' : 'space-between' // 折り畳み時は中央、展開時は両端
      }}>
        {!isCollapsed && (
          <div style={styles.logo}>
            <img src={blackboardIcon} alt="黒板" style={styles.logoIcon} />
            黒板アプリ
          </div>
        )}
        <button
          onClick={() => onToggleCollapse(!isCollapsed)}
          style={styles.toggleButton}
          title={isCollapsed ? '展開する' : '折り畳む'}
        >
          {isCollapsed ? '☰' : '✕'}
        </button>
      </div>

      {/* 部屋リスト */}
      <div className="navbar-room-list">
        <div style={styles.roomLabel}>
          {!isCollapsed && '部屋一覧'}
        </div>
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => onRoomChange(room.id)}
            style={{
              ...styles.roomButton,
              ...(currentRoom === room.id ? styles.activeRoomButton : {}),
              justifyContent: isCollapsed ? 'center' : 'flex-start'
            }}
            title={`${room.name} - ${room.description}`}
          >
            <span style={styles.roomIcon}>{room.icon}</span>
            {!isCollapsed && <span style={styles.roomName}>{room.name}</span>}
          </button>
        ))}
      </div>

      {/* 広告エリア（展開時のみ表示） */}
      {!isCollapsed && (
        <div className="navbar-ad-container">
          <AdSense 
            adSlot="ca-pub-6900334221369927"
            adFormat="auto"
          />
        </div>
      )}

      {/* 現在の部屋情報 */}
      <div 
        className="navbar-footer"
        style={{
          opacity: isCollapsed ? 0 : 1,
          visibility: isCollapsed ? 'hidden' : 'visible'
        }}
      >
        <div className="current-room-label">現在の部屋:</div>
        <div className="current-room">
          {rooms.find(r => r.id === currentRoom)?.icon} {rooms.find(r => r.id === currentRoom)?.name || currentRoom}
        </div>
        {currentRoom === 'study' ? (
          <div style={{ color: '#999', fontSize: '10px', marginTop: '5px' }}>
            ※ 個人用（他の人と共有されません）
          </div>
        ) : (
          <div style={{ color: '#999', fontSize: '10px', marginTop: '5px' }}>
            ※ 共有黒板（他の人と共有されます）
          </div>
        )}
      </div>
    </nav>
  );
};

// スタイル定義
const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    height: '100%',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRight: '2px solid #333',
    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
    overflow: 'hidden',
    flexShrink: 0 // サイドバーのサイズを固定
  },
  header: {
    padding: '15px',
    borderBottom: '2px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // 折り畳み時に中央配置
    gap: '10px',
    minHeight: '60px'
  },
  logo: {
    fontSize: '16px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0 // フレックスアイテムの縮小を許可
  },
  logoIcon: {
    width: '24px',
    height: '24px'
  },
  toggleButton: {
    backgroundColor: 'transparent',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '5px 10px',
    transition: 'all 0.2s',
    minWidth: '36px',
    height: '36px'
  },
  roomList: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '15px 10px 60px', // 上 左右 下（AdSenseエリア分の余白）
    minHeight: 0 // フレックスアイテムのスクロールを有効にする
    // overflow-yとpaddingBottomはCSSで管理
  },
  roomLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#999',
    marginBottom: '5px',
    paddingLeft: '5px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    minHeight: '20px' // 高さを固定
  },
  roomButton: {
    padding: '12px 15px',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'left'
  },
  activeRoomButton: {
    backgroundColor: '#4ecdc4',
    color: '#000',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(78, 205, 196, 0.3)'
  },
  roomIcon: {
    fontSize: '18px',
    minWidth: '20px',
    textAlign: 'center'
  },
  roomName: {
    flex: 1
  },
  roomDescription: {
    fontSize: '10px',
    color: '#999',
    marginTop: '3px',
    fontWeight: 'normal'
  },
  adContainer: {
    padding: '10px',
    borderTop: '1px solid #333',
    backgroundColor: '#0a0a0a',
    minHeight: '80px',
    maxHeight: '120px',
    flexShrink: 0,
    overflow: 'hidden'
  },
  footer: {
    padding: '15px',
    borderTop: '2px solid #333',
    fontSize: '12px',
    backgroundColor: '#0f0f0f',
    minHeight: '70px', // 高さを固定
    flexShrink: 0, // 縮小を防止
    transition: 'opacity 0.3s ease, visibility 0.3s ease' // スムーズな表示切り替え
  },
  currentRoomLabel: {
    color: '#999',
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  currentRoom: {
    color: '#4ecdc4',
    fontWeight: 'bold',
    fontSize: '13px'
  }
};

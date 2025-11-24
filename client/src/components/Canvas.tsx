import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { DrawingStroke, Point } from '../types/drawing';

interface CanvasProps {
  strokes: DrawingStroke[];           // 描画するストロークの配列
  onStrokeComplete: (stroke: DrawingStroke) => void;  // ストローク完了時のコールバック
  color: string;                      // ペンの色
  lineWidth: number;                  // ペンの太さ
  tool: 'pen' | 'eraser';            // 使用中のツール
  roomId: string;                     // 部屋ID
}

/**
 * 黒板のCanvasコンポーネント
 */
export const Canvas: React.FC<CanvasProps> = ({
  strokes,
  onStrokeComplete,
  color,
  lineWidth,
  tool,
  roomId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);

  /**
   * ストロークを描画
   */
  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    if (stroke.points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = stroke.tool === 'eraser' ? '#2d5016' : stroke.color;
    ctx.lineWidth = stroke.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  }, []);

  // Canvasのサイズを画面に合わせる
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {        
        // CSSで設定されたサイズを取得
        const rect = canvas.getBoundingClientRect();
        
        // スマホ判定：画面幅が768px以下の場合は固定サイズ
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          // スマホでは固定サイズを使用
          canvas.width = 1200;
          canvas.height = 800;
        } else {
          // デスクトップではrectのサイズを使用
          canvas.width = rect.width;
          canvas.height = rect.height;
        }
        
        // 背景色を塗りつぶし（画面回転時も必ず再描画）
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#2d5016';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // 全ストロークを再描画
          strokes.forEach((stroke) => {
            drawStroke(ctx, stroke);
          });
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    // orientationchangeイベントも監視（画面回転対応）
    window.addEventListener('orientationchange', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
    };
  }, [strokes, drawStroke]);

  // ストロークが更新されたら再描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // canvasのサイズが0の場合は設定する（初期化時）
    if (canvas.width === 0 || canvas.height === 0) {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        canvas.width = 1200;
        canvas.height = 800;
      } else {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    }

    // キャンバスをクリア（黒板の緑色で塗りつぶし）
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 全ストロークを描画
    strokes.forEach((stroke) => {
      drawStroke(ctx, stroke);
    });
  }, [strokes, drawStroke]);

  /**
   * マウス座標を取得
   */
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  /**
   * 描画開始
   */
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const point = getMousePos(e);
    setCurrentPoints([point]);
  };

  /**
   * 描画中
   */
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getMousePos(e);
    const newPoints = [...currentPoints, point];
    setCurrentPoints(newPoints);

    // リアルタイムプレビュー
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawStroke(ctx, {
      id: '',
      roomId,
      points: newPoints,
      color,
      lineWidth,
      tool,
      timestamp: Date.now()
    });
  };

  /**
   * 描画終了
   */
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPoints.length > 1) {
      // ストロークを完成させてサーバーに送信
      const stroke: DrawingStroke = {
        id: `${Date.now()}-${Math.random()}`,
        roomId,
        points: currentPoints,
        color,
        lineWidth,
        tool,
        timestamp: Date.now()
      };
      onStrokeComplete(stroke);
    }
    setCurrentPoints([]);
  };

  // ネイティブタッチイベントリスナーを登録（passive: false で preventDefault を有効化）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault(); // 1本指の時のみスクロールを防止
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const point = {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        };
        setIsDrawing(true);
        setCurrentPoints([point]);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDrawing || e.touches.length !== 1) {
        if (e.touches.length > 1) {
          // 2本指以降は描画を中断
          setIsDrawing(false);
          setCurrentPoints([]);
        }
        return;
      }
      
      e.preventDefault(); // 描画中はスクロールを防止
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const point = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
      
      setCurrentPoints(prev => {
        const newPoints = [...prev, point];
        
        // リアルタイムプレビュー
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawStroke(ctx, {
            id: '',
            roomId,
            points: newPoints,
            color,
            lineWidth,
            tool,
            timestamp: Date.now()
          });
        }
        
        return newPoints;
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isDrawing) {
        e.preventDefault();
        stopDrawing();
      }
    };

    // passive: false オプションで登録
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDrawing, roomId, color, lineWidth, tool, drawStroke, currentPoints]);

  // カーソルスタイルを取得
  const getCursorStyle = (): string => {
    if (tool === 'pen') {
      // チョークのカーソル（白い円）
      const size = Math.max(lineWidth * 2, 16);
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${size/2}" cy="${size/2}" r="${lineWidth}" fill="${color}" stroke="white" stroke-width="1" opacity="0.8"/>
        </svg>
      `;
      const encoded = encodeURIComponent(svg);
      return `url('data:image/svg+xml,${encoded}') ${size/2} ${size/2}, crosshair`;
    } else {
      // 黒板消しのカーソル（灰色の四角）
      const size = Math.max(lineWidth, 20);
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <rect x="1" y="1" width="${size-2}" height="${size-2}" fill="rgba(150, 150, 150, 0.5)" stroke="white" stroke-width="2" rx="2"/>
        </svg>
      `;
      const encoded = encodeURIComponent(svg);
      return `url('data:image/svg+xml,${encoded}') ${size/2} ${size/2}, crosshair`;
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      style={{
        cursor: getCursorStyle(),
        display: 'block',
        width: '100%',
        height: '100%',
        borderRadius: '2px'
      }}
    />
  );
};

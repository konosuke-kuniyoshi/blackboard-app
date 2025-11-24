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
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        
        // CSSで設定されたサイズを取得
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // サイズが変更された場合は再描画をトリガー
        if (oldWidth !== canvas.width || oldHeight !== canvas.height) {
          // 背景色を塗りつぶし
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
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [strokes, drawStroke]);

  // ストロークが更新されたら再描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

  /**
   * タッチ座標を取得
   */
  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  /**
   * タッチ開始
   */
  const startTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // 1本指のみ描画を許可、2本指以降はスクロール用
    if (e.touches.length === 1) {
      // ブラウザのデフォルト動作を完全に防止
      e.preventDefault();
      e.stopPropagation();
      
      setIsDrawing(true);
      const point = getTouchPos(e);
      setCurrentPoints([point]);
    }
  };

  /**
   * タッチ移動
   */
  const touchDraw = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // 描画中は1本指のみ
    if (isDrawing && e.touches.length === 1) {
      // ブラウザのスクロールを完全に防止
      e.preventDefault();
      e.stopPropagation();
      
      const point = getTouchPos(e);
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
    } else if (e.touches.length >= 2) {
      // 2本指以降が触れたら描画を中断（スクロール許可）
      if (isDrawing) {
        setIsDrawing(false);
        setCurrentPoints([]);
      }
    }
  };

  /**
   * タッチ終了
   */
  const stopTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      e.preventDefault();
      e.stopPropagation();
      stopDrawing();
    }
  };

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
      onTouchStart={startTouchDrawing}
      onTouchMove={touchDraw}
      onTouchEnd={stopTouchDrawing}
      onTouchCancel={stopTouchDrawing}
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

import { useEffect } from 'react';

/**
 * Google AdSense広告コンポーネント
 */
export const AdSense: React.FC<{
  adSlot: string;
  adFormat?: string;
  style?: React.CSSProperties;
}> = ({ adSlot, adFormat = 'auto', style }) => {
  
  useEffect(() => {
    try {
      // AdSenseスクリプトが読み込まれているか確認
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div style={{
      ...style,
      overflow: 'hidden',
      flexShrink: 0, // サイズ固定
      position: 'relative'
    }}>
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block',
          minHeight: '50px', // 最小高さを確保
          maxHeight: '100px' // 最大高さを制限
        }}
        data-ad-client="ca-pub-6900334221369927"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

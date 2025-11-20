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
    <div style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

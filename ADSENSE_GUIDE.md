# Google AdSense 設定ガイド

このガイドでは、Google AdSenseアカウントを作成し、黒板アプリに広告を設定する手順を説明します。

## 前提条件

- 18歳以上であること
- Googleアカウントを持っていること
- デプロイ済みのウェブサイト（Vercel等）

## ステップ1: AdSenseアカウントの作成

1. [Google AdSense](https://www.google.com/adsense/) にアクセス
2. 「ご利用開始」をクリック
3. Googleアカウントでログイン
4. 必要情報を入力：
   - ウェブサイトのURL（例: `https://blackboard-app.vercel.app`）
   - 国/地域
   - 利用規約に同意

## ステップ2: サイトをAdSenseに接続

1. AdSenseコードを取得：
   - AdSenseダッシュボードで「サイトを接続」をクリック
   - 表示されるコードをコピー

2. コード例：
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
     crossorigin="anonymous"></script>
```

3. `ca-pub-XXXXXXXXXX` の部分をコピー

## ステップ3: アプリに AdSense コードを設定

### 1. index.html を更新

`client/index.html` を開き、`ca-pub-XXXXXXXXXX` を実際のパブリッシャーIDに置き換え：

```html
<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
     crossorigin="anonymous"></script>
```

### 2. AdSense.tsx を更新

`client/src/components/AdSense.tsx` を開き、`ca-pub-XXXXXXXXXX` を置き換え：

```typescript
data-ad-client="ca-pub-1234567890123456"
```

### 3. 広告スロットIDを取得

1. AdSenseダッシュボードで「広告」→「広告ユニット」を開く
2. 「ディスプレイ広告」を選択
3. 広告ユニット名を入力（例: "サイドバー広告"）
4. 広告サイズを選択（「レスポンシブ」推奨）
5. 「作成」をクリック
6. 広告スロットID（`data-ad-slot="XXXXXXXXXX"`）をコピー

### 4. Navbar.tsx を更新

`client/src/components/Navbar.tsx` を開き、広告スロットIDを設定：

```typescript
<AdSense 
  adSlot="1234567890"  // ここに実際の広告スロットIDを入力
  adFormat="auto"
  style={{ minHeight: '100px' }}
/>
```

## ステップ4: サイトの審査

1. コードを実装したら、変更をデプロイ：
```bash
git add .
git commit -m "Add Google AdSense"
git push
```

2. AdSenseダッシュボードで「サイトの審査をリクエスト」をクリック

3. 審査期間：通常1〜2週間
   - サイトのコンテンツが審査されます
   - ポリシー違反がないか確認されます

## AdSense審査に合格するためのヒント

### コンテンツの要件
- ✅ オリジナルで有用なコンテンツ
- ✅ 十分な量のコンテンツ（最低でも10〜15ページ）
- ✅ ナビゲーションが明確
- ✅ プライバシーポリシーページ
- ✅ お問い合わせページ

### 避けるべきこと
- ❌ コピーされたコンテンツ
- ❌ 成人向けコンテンツ
- ❌ 違法なコンテンツ
- ❌ クリックを促す文言（「広告をクリックしてください」等）

## 広告の配置場所

現在の実装では、以下の場所に広告が表示されます：

1. **サイドバー**（Navbar）
   - 部屋リストの下
   - サイドバーを展開時のみ表示

### 追加の広告配置案

#### ツールバーの上部
```typescript
// App.tsx に追加
<AdSense 
  adSlot="XXXXXXXXXX"
  adFormat="horizontal"
  style={{ marginBottom: '10px' }}
/>
```

#### 黒板の下部
```typescript
// Canvas.tsx の下に追加
<AdSense 
  adSlot="XXXXXXXXXX"
  adFormat="horizontal"
  style={{ marginTop: '10px' }}
/>
```

## 収益の目安

### 期待される収益（目安）
- **1,000ページビュー**: $1〜$5
- **10,000ページビュー**: $10〜$50
- **100,000ページビュー**: $100〜$500

### 収益を増やす方法
1. トラフィックを増やす（SEO、SNS活用）
2. 広告の配置を最適化
3. クリック率（CTR）の高い場所に配置
4. ユーザー体験を損なわない程度に広告を増やす

## トラブルシューティング

### 広告が表示されない

1. **AdSenseコードが正しいか確認**
   - パブリッシャーIDが正しいか
   - 広告スロットIDが正しいか

2. **審査に合格しているか確認**
   - AdSenseダッシュボードで確認

3. **広告ブロッカーを無効化**
   - テスト時は広告ブロッカーをオフに

4. **コンソールエラーを確認**
   - ブラウザの開発者ツールでエラーを確認

### 審査に不合格

1. **理由を確認**
   - AdSenseからのメールを確認
   - ポリシー違反の内容を修正

2. **コンテンツを充実させる**
   - より多くの有用なコンテンツを追加
   - 使い方ガイド、チュートリアルなど

3. **再申請**
   - 問題を修正後、2週間待ってから再申請

## 代替の収益化方法

AdSenseの審査に合格するまで、または併用できる方法：

1. **Buy Me a Coffee / Ko-fi**
   - 寄付ボタンを追加
   - 審査不要

2. **GitHub Sponsors**
   - 開発者向けの寄付プラットフォーム

3. **有料プラン**
   - プレミアム機能を有料で提供
   - Stripe等で決済

## 参考リンク

- [Google AdSense ヘルプ](https://support.google.com/adsense)
- [AdSense プログラムポリシー](https://support.google.com/adsense/answer/48182)
- [広告配置に関するガイド](https://support.google.com/adsense/answer/1354736)

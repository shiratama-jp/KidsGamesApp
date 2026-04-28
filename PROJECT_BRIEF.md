# にこにこどうぶつらんど（旧：やさしいせかいシリーズ） PWA化プロジェクト仕様書

## プロジェクト概要

幼児向けHTMLミニゲーム集「にこにこどうぶつらんど」をPWA（Progressive Web App）としてまとめ、スマートフォン・タブレットのホーム画面からアプリとして起動できるようにする。

## 現状

- 16本の単体HTMLゲームが完成済み（各ゲームは1つのHTMLファイルで完結）
- すべてHTML + JavaScript + CSSで構成（外部依存はGoogle Fontsのみ）
- フレームワーク未使用
- 共通デザイン：Zen Maru Gothicフォント、キラキラパーティクル演出、非懲罰的フィードバック（「ちがうよ〜」+ぶるぶる）、7秒自動進行、結果画面「⭐よくできたね！⭐」

## 完成済みゲーム一覧（16本）

| # | ファイル名 | タイトル | ジャンル |
|---|-----------|---------|---------|
| 1 | animal-guess.html | かくれんぼ どうぶつ | ヒント付きクイズ |
| 2 | doubutsu-irukana.html | どうぶつ いるかな？ | モグラ叩き型さがし |
| 3 | doubutsu-puzzle.html | どうぶつ ぱずる | 4分割パズル |
| 4 | okashi-dotti.html | おかしはどっち？ | 左右えらび |
| 5 | e-wo-tsukurou.html | えをつくろう | 場面完成 |
| 6 | doubutsu-sagasou.html | どうぶつをさがそう | 神経衰弱 |
| 7 | okashi-no-hako.html | おかしのはこ | シャッフル当て |
| 8 | doubutsu-montage.html | どうぶつモンタージュ | 顔合わせ |
| 9 | hakoireotetsudai.html | はこいれおてつだい | 数と箱詰め |
| 10 | onaka-ga-suitayo.html | おなかがすいたよ | 好物マッチ |
| 11 | ohayou-oyasumi.html | おはようからおやすみまで | じぶんの1日をつくる |
| 12 | tabemono-dokara.html | たべものはどこからくるの？ | 食べ物と産地マッチ |
| 13 | doubutsu-janken.html | どうぶつじゃんけん | ヒント付きじゃんけん |
| 14 | doubutsu-puzzle2.html | どうぶつぱずる2 | 回転パズル |
| 15 | suuji-de-yobou.html | すうじでよぼう | 数字と扉 |
| 16 | kotori-esa.html | ことりにえさをとどけよう | あみだくじ |

## 技術方針

### PWA構成

- **フレームワーク**: React or Vue（要検討。既存HTMLをiframeで埋め込むか、コンポーネント化するか）
- **ホスト方式**: 静的ファイルホスティング（GitHub Pages, Vercel, Netlify等）
- **オフライン対応**: Service Workerで全ゲームをキャッシュ
- **ホーム画面追加**: manifest.jsonでアプリアイコン・スプラッシュ画面を設定

### 最もシンプルなアプローチ（推奨）

既存の16本のHTMLファイルはそのまま活かし、以下を新規作成する：

1. **index.html** - トップ画面（ゲーム選択メニュー）
2. **manifest.json** - PWA設定
3. **service-worker.js** - オフラインキャッシュ
4. **style.css** - トップ画面用スタイル

各ゲームはiframe or 単純なページ遷移で表示。ゲーム本体のHTMLは極力変更しない。

### 将来的な拡張（今回のスコープ外）

- **カード集め報酬システム**:
  - `localStorage` で「1日ごとのプレイ回数」をカウント。
  - 遊んだゲームには☆マークがつく。
  - ☆が一定数たまるとルーレットが回って、デジタルカードをゲットできる。
- **カード図鑑ページ**:
  - 集めたカードを一覧できるページを作成。
  - カレンダー形式でのプレイ記録表示なども検討。
- **音声**: あみたろの声素材工房の素材を検討中
- **Google Play公開**: TWA（Trusted Web Activity）でラップすればストア公開可能（その場合のみAndroid Studioが必要）

## 背景デザイン仕様（全ゲーム共通・基本設定）

`doubutsu-puzzle.html` で確定したデザインを全ゲームの標準とする。

### 構成

| レイヤー | 内容 |
|---|---|
| 固定背景SVG | `position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1;` |
| フッター花飾り | `position:fixed; bottom:0; left:0; width:100%; height:70px; z-index:5; pointer-events:none;` |
| ゲームコンテンツ | `padding-top:70px; padding-bottom:80px;` |

### 背景SVG構成（上から順）

```
空（水色グラデ） ─── #87CEEB → #c8eaff（全面）
雲（白楕円）   ─── y=20〜65あたり
太陽           ─── 右上 (cx=338, cy=40)
─── 空/草地の境界 y=125 ─────────────────
草地（緑グラデ）─── #d8f0d0 → #a8d890（index.htmlと同じ）
木（左右2本）   ─── 境界線上に配置
花のフッター    ─── 画面最下部に固定
```

### 注意事項

- **山（三角形）・虹は使用しない**（ゲームコンテンツと被るため）
- **グラデーションIDは `np-sky` / `np-gr`** を使う（`sky`/`gr`はirukana専用）
- タイトル+サブタイトルは **クリーム背景カード** でまとめる：`background: rgba(255,248,210,0.85); border-radius:16px;`
- 地平線の草ぽこぽこ楕円（`<g fill="#90c878">`）は**入れない**（ゲーム内容と被る）

### 実装テンプレート（新ゲーム作成時）

```html
<!-- body直後に追加 -->
<div id="bg-nature" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;overflow:hidden;">
<svg viewBox="0 0 380 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <defs>
    <linearGradient id="np-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#87CEEB"/><stop offset="100%" stop-color="#c8eaff"/></linearGradient>
    <linearGradient id="np-gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d8f0d0"/><stop offset="100%" stop-color="#a8d890"/></linearGradient>
  </defs>
  <rect width="380" height="600" fill="url(#np-sky)"/>
  <!-- 雲 -->
  <g fill="white" opacity="0.9">
    <ellipse cx="60" cy="50" rx="40" ry="19"/><ellipse cx="86" cy="42" rx="33" ry="17"/><ellipse cx="38" cy="49" rx="25" ry="13"/>
    <ellipse cx="280" cy="65" rx="48" ry="21"/><ellipse cx="312" cy="55" rx="36" ry="17"/><ellipse cx="252" cy="63" rx="28" ry="13"/>
    <ellipse cx="168" cy="30" rx="30" ry="13"/><ellipse cx="189" cy="23" rx="24" ry="11"/>
  </g>
  <!-- 太陽 -->
  <circle cx="338" cy="40" r="26" fill="#ffe060" opacity="0.9"/>
  <g stroke="#ffe060" stroke-width="2.5" opacity="0.7">
    <line x1="338" y1="4" x2="338" y2="0"/><line x1="362" y1="14" x2="368" y2="8"/>
    <line x1="374" y1="40" x2="380" y2="40"/><line x1="362" y1="66" x2="368" y2="72"/>
    <line x1="314" y1="14" x2="308" y2="8"/>
  </g>
  <!-- 草地（y=125から） -->
  <rect x="0" y="125" width="380" height="475" fill="url(#np-gr)"/>
  <!-- 木（左） -->
  <rect x="8" y="125" width="11" height="45" fill="#8B5e30"/>
  <ellipse cx="14" cy="110" rx="25" ry="27" fill="#3a8e3a"/>
  <ellipse cx="5" cy="119" rx="15" ry="18" fill="#4a9e4a"/>
  <ellipse cx="23" cy="121" rx="15" ry="16" fill="#2a7e2a"/>
  <!-- 木（右） -->
  <rect x="358" y="125" width="12" height="45" fill="#8B5e30"/>
  <ellipse cx="364" cy="108" rx="25" ry="27" fill="#3a8e3a"/>
  <ellipse cx="353" cy="118" rx="16" ry="18" fill="#4a9e4a"/>
  <ellipse cx="374" cy="120" rx="15" ry="16" fill="#2a7e2a"/>
</svg>
</div>

<!-- body末尾に追加（花フッター） -->
<div id="footer-flowers" style="position:fixed;bottom:0;left:0;width:100%;height:70px;z-index:5;pointer-events:none;">
<svg viewBox="0 0 380 70" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <!-- irukanaのflower-svgと同じ内容 -->
</svg>
</div>
```

## BGM仕様（全ゲーム共通・基本設定）

モバイルブラウザのオートプレイ制限に対応するため、以下の設計を採用する。

### 再生フロー

1. **メイン画面（index.html）**: BGMは流さない。グローバルのON/OFFスイッチのみ配置。
2. **各ゲーム画面**: 「はじめる」ボタンをトップに設ける。このボタンが押されたタイミングで `AudioManager.startBGM()` を呼び、ゲームを開始する。
3. **ゲームクリア時**: `AudioManager.stopBGM()` を呼びフェードアウト（目安1秒）で停止する。

### BGM設定の共有

- グローバルON/OFF設定は `localStorage('bgmEnabled')` で全ページ共通。
- 各ゲームページにも BGM ON/OFF トグルボタンを配置する（メイン画面と同じUI）。
- BGMがOFFの状態で「はじめる」を押してもBGMは流れない（設定を尊重）。

### audio-manager.js API（ゲーム実装時に使う関数）

| 関数 | 用途 |
|------|------|
| `AudioManager.startBGM()` | 「はじめる」ボタン押下時に呼ぶ。bgmEnabledがtrueのときのみ再生 |
| `AudioManager.stopBGM()` | ゲームクリア時に呼ぶ。フェードアウトして停止 |
| `AudioManager.toggleBGM()` | ON/OFFボタン押下時に呼ぶ。現在の再生状態を反転 |
| `AudioManager.playPoyon()` | 選択・ボタン押し効果音 |
| `AudioManager.playCorrect()` | 正解効果音 |
| `AudioManager.playWrong()` | 不正解効果音 |
| `AudioManager.playClear()` | 全クリア効果音（stopBGMの直前に呼ぶ） |

### 実装テンプレート（新ゲーム作成時のひな形）

```html
<!-- ゲーム画面のBGMトグルボタン（各ページ共通） -->
<button id="bgm-toggle" class="bgm-btn" type="button">🎵⏸️</button>

<script src="./audio-manager.js"></script>
<script>
  // BGMトグルボタンの初期化
  const bgmBtn = document.getElementById('bgm-toggle');
  function refreshBgmIcon() {
    bgmBtn.textContent = AudioManager.isPlaying() ? '🎵⏸️' : '🎵▶️';
  }
  AudioManager.initBGM();
  AudioManager.bgm.addEventListener('play', refreshBgmIcon);
  AudioManager.bgm.addEventListener('pause', refreshBgmIcon);
  refreshBgmIcon();
  bgmBtn.addEventListener('click', () => { AudioManager.toggleBGM(); refreshBgmIcon(); });

  // 「はじめる」ボタン
  document.getElementById('start-btn').addEventListener('click', () => {
    AudioManager.startBGM();  // ← ここでBGM開始
    startGame();
  });

  // ゲームクリア時
  function onGameClear() {
    AudioManager.playClear();
    AudioManager.stopBGM();   // ← フェードアウト停止
    // クリア画面表示など...
  }
</script>
```

## デザイン哲学（重要：全ゲーム共通）

1. **非懲罰的**: 間違えても怒らない。「ちがうよ〜」+ぶるぶるアニメ。正解するまで何度でも挑戦可能
2. **色覚アクセシビリティ**: 色だけでなく形状・境界線を併用
3. **多様性尊重**: 家庭ごとの正解を認める（例：時計ゲームは「正解がない」設計）
4. **「きみ」呼び**: 性別を問わない呼びかけ
5. **自動進行7秒**: 幼児が「次へ」ボタンの概念を知らなくてもOK
6. **やさしいフォント**: Zen Maru Gothic（丸ゴシック）を全ゲームで統一

## 開発環境

- **エディタ**: VSCode（Portable版）+ Claude Code拡張
- **言語**: HTML / CSS / JavaScript
- **テスト**: ブラウザで直接確認（Chrome DevToolsのモバイルエミュレーション活用）

## まず最初にやること

1. プロジェクトフォルダを作成し、16本のHTMLファイルを配置
2. トップ画面（ゲーム選択メニュー）を作成
3. manifest.json + service-worker.js を作成してPWA化
4. ローカルサーバーで動作確認（`npx serve` 等）
5. スマホでホーム画面に追加して動作確認
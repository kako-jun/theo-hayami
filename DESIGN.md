---
name: theo-hayami
description: 「叡智の星海」──人類の知見が蓄えられた星海に迷い込んだゲーム画面のような没入。図書館的な意匠を残しつつ、汎用UI chromeを禁じ、半透明ガラス板＋真鍮/金の細線＋明朝で組む文学・静謐トーン。osaka-kenpo の兄弟（懐旧の紙・蝋燭の金）。
colors:
  # 実装済みの値（src/styles/global.css @theme）。本番稼働サイトなので TBD ではない。
  ink: "#12111a"          # 紺墨＝地の底。生成絵の下に敷くスクリムの色
  ink-deep: "#0a0910"     # 最暗。html/body 背景・reader stage の地
  ivory: "#f1e8d6"        # アイボリー＝本文・地の紙色（既定文字色）
  ivory-dim: "#cabfa8"    # 弱いアイボリー。パンくず・sub テキスト
  gold: "#b8934f"         # 真鍮/金＝細線・押印・扉の枠
  gold-bright: "#e6c47e"  # 明るい金。ホバーで灯る線・読了の灯り
  theo: "#fff6e6"         # せお（主人公）色。せおのセリフ・せお関連要素の差し色にのみ使う
typography:
  mincho:
    fontFamily: '"Hina Mincho", "Hiragino Mincho ProN", "Yu Mincho", serif'
    usage: 見出し・本文とも明朝で統一（汎用サンセリフに逃げない）
    heading-letter-spacing: "0.04em"
layout:
  card-grid: "2→3→4 cols (640px / 960px)"     # .th-grid（扉カード）
  theme-grid: "1→2→3 cols (640px / 960px)"    # .th-theme-grid
  reader: "aspect 9/16, max-width 30rem"       # .th-reader（name-name 埋め込みの器）
elevation:
  panel: "rgba(18,17,26,0.58) + backdrop-blur 14px + 真鍮枠 rgba(184,147,79,0.45) + inset金 + drop-shadow"
  backdrop: "fixed 全画面の生成絵 + 紺墨グラデスクリム（ベタ塗り禁止）。__glow は overlay 合成・opacity 0.55・blur 7px。スクロール連動微ズーム（--th-zoom を base/glow の scale に乗算・1→1.12）"
shapes:
  radius: minimal   # 汎用の角丸カードにしない。読了の蔵書印だけ 2px、面は基本シャープ
components:
  th-panel: 半透明ガラス板＋真鍮の細線（汎用UIのカード/モーダルの代わり）
  th-door: 押せる面（扉・カード）。ホバー/フォーカスで金の線が灯る
  th-cover: トップ表紙。集合キービジュアルを全幅で使い、CSSの明朝組版と細罫で誌面風に重ねる
  th-resident-card: 住人選択カード専用。販促絵を枠までブリードさせ、ボタンよりグラビア誌面に寄せる
  th-resident-feature: 住人詳細の大判キービジュアル。正式文字画像まではCSS文字組みだけを重ねる
  th-magazine-section: 本文の誌面風セクション。ノンブル/細罫/明朝見出し
  th-door.is-read: 読了セル。暗くせず温かい金の灯り＋右上に金の蔵書印「読了」
  th-door.is-read-all: 束ねる全セル完読で金の灯りを強める
  th-hairline: 真鍮の細線区切り
  th-breadcrumb: パンくず（生成絵の上に直接乗るため text-shadow で可読性担保）
  th-breadcrumb__version: パンくず行右に添える版表示（`vYYYY-MM-DD`）
  th-footer: サイト共通フッタのコンテナ（QR・作者導線・訪問カウンタを縦積み）
  th-footer__qr: QRコード画像。透過・白モジュールのみの画像に、CSS側で背景色（`var(--color-th-ink)`）を持たせる
  th-footer__author: 作者導線（`llll-ll.com`リンク＋copyright）
  th-footer__visits: 訪問カウンタのラベル行
  th-link-button: 「読む」・戻り導線のボタン
  th-face-crop / th-face-crop--bust: 顔アップ/LoRAバストアップカードの正方形トリミング
  th-reader: name-name 埋め込みの 9:16 ステージ＋開始CTA
  th-glow: パネル外で生成絵に直接乗る文字の text-shadow
---

## Overview

theo-hayami の公開名としての舞台は **「叡智の星海」**。Webページに見せず、「人類の知見が蓄えられた星海に迷い込んだゲーム画面」の没入感を狙う。視覚モチーフとしては図書館的な書架・紙・真鍮を残す。osaka-kenpo の兄弟だが、文学・静謐トーン（懐旧の紙・蝋燭の金）に振る。

すべての値は**実装済み**（`src/styles/global.css` の `@theme`）。本番稼働サイトなので、このトークンは決定済みの実値であって TBD ではない。詳細な実装意図はコード内コメントと `docs/07_visual/` を参照。

## Colors

紺墨（ink）を地に、アイボリー（ivory）の紙色で読ませ、真鍮/金（gold）の細線で図書館の調度を描く。

- **ink `#12111a` / ink-deep `#0a0910`**: 地の底。生成絵の下のスクリム、html/body 背景、reader stage の地。
- **ivory `#f1e8d6` / ivory-dim `#cabfa8`**: 本文の紙色と、その弱め（パンくず・sub）。
- **gold `#b8934f` / gold-bright `#e6c47e`**: 真鍮の細線・扉の枠・押印。ホバーで gold-bright が灯る。読了の金の灯りもこれ。
- **theo `#fff6e6`**: せお（主人公）専用の差し色。**せお関連要素以外に使わない。**

## Typography

- 見出しも本文も **Hina Mincho（明朝）で統一**する。**汎用サンセリフに逃げない**（文学トーンの核）。見出しは `letter-spacing: 0.04em`。
- 正式なキャラ名タイポグラフィ画像が未配置の箇所では、仮の画像を作らず CSS 文字組みで留める。

## Layout

- 扉カードのグリッド（`.th-grid`）は 2→3→4 列（640/960px）、テーマグリッド（`.th-theme-grid`）は 1→2→3 列。
- 「読む」ページ（`.th-reader`）は name-name の 9:16 ノベル画面に合わせ、`aspect-ratio: 9/16`・`max-width: 30rem`。

## Elevation & Depth

- **背景はベタ塗りにしない。** 生成絵（`assets/images/shadow-library/*.webp`）を `position: fixed` で全画面に敷き、上下に紺墨のグラデーションスクリムを重ねて可読性を確保する。`__glow` は同じ絵のぼかしコピーを `mix-blend-mode: overlay`・opacity 0.55・blur 7px で薄く重ね、アップスケールの粗さを溶かす。
- 背景はスクロール進捗に応じて微ズーム（`--th-zoom` を base/glow の既存 scale に乗算し 1→1.12、`transform-origin: center`、`prefers-reduced-motion` で無効化）。下端でツールバー collapse による再描画のガクツキを吸収する。
- 面（パネル/扉）は**半透明ガラス**（`backdrop-filter: blur(14px)` ＋ 真鍮枠 ＋ inset の金の微光 ＋ drop-shadow）。ガラス越し・蝋燭の金の空気を出す。
- backdrop に**負の z-index を使わない**（body 背景の下に潜り生成絵が消える罠。実機blinkで確認済み）。

## Shapes

- 汎用の角丸カードに揃えない。面は基本シャープ、読了の蔵書印だけ `border-radius: 2px`。

## Components

- **th-panel**: 半透明ガラス板＋真鍮の細線。汎用UIのカード/モーダルの代わり。
- **th-door**: 押せる面（扉・カード）。ホバー/フォーカスで金の線が灯る。
- **th-door.is-read（読了）**: 読了は「達成」なので**暗くしない**（トーン落とし＝消化済みのネガ印象は不採用）。逆に温かい金の灯りをともし、右上に金の蔵書印「読了」を押す。派手にしない。`.is-read-all` は束ねる全セル完読で灯りを強める。
- **th-breadcrumb / th-glow**: パネル外で生成絵に直接乗る文字は `text-shadow` で可読性を担保する。
- **th-reader**: name-name 埋め込みの 9:16 ステージ＋開始 CTA（金の漢字ラベル）。
- **th-face-crop / --bust**: 立ち絵/LoRAバストアップの顔アップカード（正方形トリミング）。
- **th-cover / th-resident-card / th-resident-feature / th-magazine-section**: Issue #35 の雑誌グラビア寄り意匠。`assets/images/promotional/` の集合絵・キャラ別ワイド絵を主役にし、正式な文字画像が来るまでは CSS の Hina Mincho、細罫、ノンブル風ラベルだけで誌面感を出す。文字画像を勝手に生成・代用しない。

## Do's and Don'ts

**Do:**
- 「図書館に迷い込んだゲーム画面」の没入を最優先にする。面は半透明ガラス＋真鍮/金の細線、文字は明朝。
- 背景は生成絵を fixed 全画面＋紺墨グラデスクリムで敷く。
- 読了は温かい金の灯り＋金の蔵書印で祝う（暗くしない）。
- せお色 `#fff6e6` はせお関連の差し色にだけ使う。

**Don't:**
- **汎用UI chrome を使わない**（角丸カード・原色ボタン・水平ナビバー等）。
- **背景をベタ塗りにしない**（生成絵を敷く）。
- **サンセリフに逃げない**（見出し・本文とも明朝）。
- **読了を暗く/半透明/トーン落としにしない**（達成をネガに見せない）。
- backdrop に負の z-index を使わない。

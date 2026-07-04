# サイト構造（実装の正本）

theo-hayami の公開サイト（Astro 静的サイト）の実装構造。設計意図の正本は GitHub Issue #20（索引・意匠設計）/ #21（内容設計）で、本書は**どう実装したか**を記録する。会話劇の描画そのものは持たず、各「読むページ」が name-name（別リポ・PixiJS ノベルエンジン）を `<iframe>` で埋め込むだけ。

## 技術スタック

- **Astro `output: "static"`**（`astro.config.mjs`）。完全静的・バックエンドレス。SSR アダプタなし＝`dist/` を CF Pages にそのまま配信。
- Tailwind（`@tailwindcss/vite`）＋ 独自トークン（`src/styles/global.css` の `--color-th-*`）。React island は不要なので入れない（hanoba と違い Nostr/PWA も持たない）。
- 本番ドメイン `theo-hayami.llll-ll.com`（`site:` に設定・OGP/sitemap の絶対URL生成に使う）。
- テスト＝vitest（`node` 環境。索引ロジックが対象）。

## ルート

すべて `src/layouts/LibraryLayout.astro`（`.th-backdrop` 背景＋フッタ）を通り、`bgImage` prop で敷く図書館背景を選ぶ。

| ルート | 内容 |
|---|---|
| `/`（`index.astro`） | 入口ヒーロー。2つの扉「物語を辿る（本編）」「業から引く（アンソロジー）」＋トップ説明 |
| `/anthology`（`anthology.astro`） | **住人から選ぶ**（索引の主軸）。顔アップカード8体グリッド |
| `/residents/<slug>`（`residents/[character].astro`） | 住人プロフィール＋その住人が答える業一覧 |
| `/themes`（`themes/index.astro`） | 業（テーマ）一覧 |
| `/themes/<theme>`（`themes/[theme].astro`） | その業に答える住人一覧 |
| `/free/<業>__<住人>`（`free/[slug].astro`） | **読むページ**。HTML額縁＋遅延 iframe 埋め込み |
| `/story`（`story.astro`） | 本編（四幕）。**プレースホルダ**（Issue #20 層4・別PR） |

「現代の問い」（Issue #15）は別コーナー・別PR。

## 索引データレイヤー（`src/lib/scripts.ts`）

**手作業の一覧をハードコードしない**（Issue #20 指示）。ビルド時に `content/scripts/free/*.md`（296本）をFSスキャンして 業(theme) × 住人(character) 索引を組み立てる。

- ファイル名 `業__住人.md` が永久キー。`slug.split("__")` はちょうど2セグメント必須（違反は throw）。
- 業の日本語名 = 各 .md の frontmatter `title`。
- **sceneId** = 各 .md の先頭見出し `## <character>-<theme>:` から取る（`?scene=` に渡す値）。name-name のメニュー/ディープリンクが依存する規約なので、integration test が `sceneId === {character}-{theme}` を全件アサートする（見出しリネームで dead embed が出るのを防ぐ回帰ネット）。
- 業の並び順・ラベル = ハブ `content/scripts/script.md` の `## hub:` の `[選択]` ブロックを正本にする（プレイヤーと同一の順序ソース）。
- 索引は「存在する組み合わせだけ」を集約＝そのままカバレッジ地図。dead cell は構造的に生じない（行列でなくファイルから組む）。

## name-name 埋め込み（`src/components/ReaderFrame.astro`）

- 「読む」タップで初めて `<iframe src="https://name-name.llll-ll.com/play/theo-hayami?scene=<sceneId>">` を生成（遅延マウント・`{ once: true }`）。1ページ1インスタンス。離脱でのアンマウントは静的サイトのフルページ遷移で自動的に満たす（SPAルータなし）。
- **契約（name-name 側で実装済み・本番検証済み）**: `?scene=` ディープリンク（name-name #386）でハブでなく該当シーンから直接開始、TitleOverlay も飛ばす（name-name #388）。対象 script ファイル外への choice ジャンプは confinement で終劇（"to be continued..."）になるため、「別の住人に聞く／業一覧へ」は iframe 内の choice でなく**HTML リンク**で用意する（`free/[slug].astro`）。
- name-name 本番は `X-Frame-Options`/`frame-ancestors` CSP を送らない＝iframe 埋め込み可（確認済み）。

## 意匠（`src/styles/global.css`）

汎用 UI chrome にしない。半透明パネル（`.th-panel`/`.th-door`）＋真鍮/金の細線＋明朝（Hina Mincho）＋アイボリー・金・紺墨。主人公色 `#FFF6E6`。

### 背景（`.th-backdrop`）と粗さ対策

背景は name-name のゲーム用 shadow-library 素材（`assets/images/shadow-library/*.webp`、build 時 `scripts/sync-assets.mjs` で `public/images/` に複製）を `object-fit: cover` で引き伸ばして流用（素材節約）。アップスケールの粗さを目立たせないため2層構成にする（name-name #316 の「平坦領域に階調＝高見え」を CSS で薄く適用）:

- **`.th-backdrop__base`**: `filter: blur(0.4px)`。グロー(overlay)の届かない暗い平坦部のアップスケールのドットを溶かす（0.4px は実機 A-B で確定。0.8px 以上はぼけすぎ）。
- **`.th-backdrop__glow`**: 同じ絵のぼかしコピー（`blur(7px)`）を `mix-blend-mode: overlay; opacity: 0.55` で重ね、平坦領域に階調を足して高見えさせる（soft-light は白霞み・暖色 tint は夕方色化で不採用＝#316 の結論）。
- `.th-backdrop::after` は文字可読性の弱いスクリム。**注意**: backdrop の z-index は `0`（負にすると body 背景色の下に潜る＝実機で絵が消える罠。コメント参照）。

### 住人の顔アップカード（`.th-face-crop--bust`）

- 全身立ち絵の兼用ではなく **LoRA 学習用のバストアップ絵**を使う（Issue #20「顔アップカード＝LoRA 元の顔アップ」）。素材は `docs/07_visual/lora-dataset/<char>/source-candidates/*_phase4-bust_neutral*.png` を選び、`magick`＋`cwebp` で `assets/images/<char>/bust.webp`（幅640・白背景のまま＝FF風のキャラアート）に変換。
- 顔位置は8体で揃える。マキヤは肩幅が広く引きの構図だったので顔中心にズームクロップ、ヒューは顔が右寄りだったので左マージンを削って左寄せ（縦長画像を1:1枠に cover すると横は全幅表示になり `object-position` の横が効かないため、元絵のクロップで調整する）。
- `bust.webp` はサイトのカード専用。name-name の立ち絵（`assets/images/<char>/normal.webp` 等）はプレイヤーが使うので消さない。

## OGP

`LibraryLayout.astro` が `og:image` に `entrance-hall.webp` の絶対URL、`twitter:card: summary_large_image`（耽美キービジュアルが「本作の売り」＝delivery_platform.md）。

## 将来の余地（未実装・別Issue）

- 参戦ムービー導線: `ResidentCard.astro` に `<div data-slot="entrance-movie" hidden>` を `<a>` の外（兄弟）に用意済み（`<a>` 入れ子の interactive trigger は不正HTMLになるため）。
- 本編四幕（`/story`）・現代の問い（Issue #15）。

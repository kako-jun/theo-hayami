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
| `/`（`index.astro`） | 入口ヒーロー。集合キービジュアルを表紙として使い、第一導線を「本編」に置く。Reading Guide は「本編」→「自由行動」→「住人から / 業から」のツリー構造 |
| `/anthology`（`anthology.astro`） | **住人から選ぶ**（索引の主軸）。顔アップカード8体グリッド |
| `/residents/<slug>`（`residents/[character].astro`） | 住人大判キービジュアル＋プロフィール＋その住人が答える業一覧 |
| `/themes`（`themes/index.astro`） | 業（テーマ）一覧。カテゴリごとにまとめて表示 |
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
- 業カテゴリは `src/lib/scripts.ts` の `THEME_CATEGORIES` をサイト表示用の型付き正本にする。初出は `docs/09_production/combination_grid_drafts.md` の分類だが、公開UIでは難語を避け、カテゴリ名を `欲・むさぼり` / `対人` / `感情` / `生きること` / `認識・知` と表示する。カテゴリ内の業順は `loadThemes()` のハブ順を保つ。現行業の分類漏れは integration test で検出する。

## name-name 埋め込み（`src/components/ReaderFrame.astro`）

- 「読む」タップで初めて `<iframe src="https://name-name.llll-ll.com/play/theo-hayami?scene=<sceneId>">` を生成（遅延マウント・`{ once: true }`）。1ページ1インスタンス。離脱でのアンマウントは静的サイトのフルページ遷移で自動的に満たす（SPAルータなし）。
- **契約（name-name 側で実装済み・本番検証済み）**: `?scene=` ディープリンク（name-name #386）でハブでなく該当シーンから直接開始、TitleOverlay も飛ばす（name-name #388）。対象 script ファイル外への choice ジャンプは confinement で終劇（"to be continued..."）になるため、「別の住人に聞く／業一覧へ」は iframe 内の choice でなく**HTML リンク**で用意する（`free/[slug].astro`）。
- name-name 本番は `X-Frame-Options`/`frame-ancestors` CSP を送らない＝iframe 埋め込み可（確認済み）。

## 既読トラッキング（Issue #30）

索引に「どのキャラのどの業を読み終わったか」を、カード色変え＋既読印で出す。name-name の既読 localStorage は name-name オリジンにあり別オリジンの索引からは読めないため、**theo-hayami が自前で完読を記録する**。「開いた＝既読」ではなく **終劇（"to be continued"）まで読み終えた＝完読** を既読とする（kako-jun 確定）。サーバー同期・アカウント連携は無し（localStorage ローカル完結）。

### 契約（name-name #395・本番デプロイ済み）

name-name は終劇（endStory）到達時、**埋め込み時のみ**親へ postMessage する:

```
{ source: "name-name", type: "story-ended", scene: <sceneId|null>, project: <projectName> }
```

`targetOrigin` は `"*"`（受け手が origin を検証する前提）。このメッセージ契約は name-name と共有＝勝手に変えない。

### 記録ストア（`src/lib/readStore.ts`・クライアント専用）

- localStorage キー **`theo-hayami:read`** ＝既読 slug（`業__住人`）の JSON 配列。slug は読むページ（`free/[slug]`）の URL スラッグ。
- `markRead(slug)`（冪等・追加のみ）／`isRead(slug)`／`getReadSet(): Set<string>`。
- `typeof localStorage === "undefined"` ガード（ビルド時評価・vitest node 環境で壊れない）。JSON 破損・非配列は空集合にフォールバック（try/catch）＝次の書き込みで自己修復。
- **キーと形式の唯一の正本**。索引側も ReaderFrame 側も、直書きせず必ずこの module を import する（二重定義の齟齬を避ける）。

### 完読の記録（`src/components/ReaderFrame.astro`）

- 遅延マウントの inline script（`is:inline`＋`define:vars`）とは別に、**バンドル `<script>`（type=module）**を持ち、そこで `readStore` を import する（`is:inline` は import 不可のため分離）。
- `.th-reader` に `data-reader-slug={slug}` を持たせ、バンドル script がそこからこのセルの slug を読む（`free/[slug].astro` が `episode.slug` を渡す）。
- `window` の `message` を受け、**`event.origin === "https://name-name.llll-ll.com"`** かつ `data.source === "name-name" && data.type === "story-ended"` のときだけ、`event.data.scene` ではなく**ページ自身の slug**を `markRead()`（埋め込みは1セルなので slug が確実）。origin 検証は本番コードで外さない。リスナ解除は静的サイトのフルページ遷移で自動。

### 索引への反映（`src/components/ReadMarks.astro`）

各索引ページに `<ReadMarks />` を1つ置く（バンドル `<script>` が `getReadSet()` を読み、描画後＝module script は defer で DOM 構築後に走る）:

- **個別セル**（1つの `業__住人` への扉）に `data-slug="業__住人"` を持たせ、既読なら `.is-read` を付与。対象は `themes/[theme].astro`（ある業に答える住人一覧）と `residents/[character].astro`（ある住人が答える業一覧）＝**最低限ここで既読印を出す**。
- **集計カード**に `data-read-group="slug,slug,..."`（束ねる読むページ群）と `[data-read-count]` を持たせ、既読数を数えて「N/M 読了」を常時出す。未読0件でも `0/M 読了` を表示し、総数と進捗を分数で把握できるようにする。全読了なら `.is-read-all`。対象は `anthology.astro`（住人カード＝その住人の全業）と `themes/index.astro`（業カード＝その業に答える全住人）。
- 未読/既読でセルをロック・並べ替えはしない（どこからでも読める・#14）。

### 意匠（`.is-read` / `.is-read-all` / `.th-read-badge`・`global.css`）

既読は「達成」なので**暗くしない**（トーン落とし＝消化済みのネガ印象は不採用・kako-jun 指示）。個別セルには温かい金の灯り（金 border＋金グロー）をともし、角に金地の「読了」蔵書印（`::after`・金地×濃墨＝押された勲章）を押す。面は沈めない。全読了カードは金の灯りを強める。既読数バッジは金で静かに。派手にしない（#20: 汎用 UI chrome 禁止）。

## 意匠（`src/styles/global.css`）

汎用 UI chrome にしない。半透明パネル（`.th-panel`/`.th-door`）＋真鍮/金の細線＋明朝（Hina Mincho）＋アイボリー・金・紺墨。主人公色 `#FFF6E6`。

### 公開語彙（Issue #56）

- 場所名は `叡智の星海`。人類史の知見が宇宙や海のように蓄積した場として見せる。
- 住人の思想的な力は `能力` ではなく `叡智` と呼ぶ（例: `叡智：認識`）。バトル能力ではなく、問いを開く知の形式として扱う。
- 実在思想家名は説明として大きく出さず、キャラ別プロフィールでは `カントの灯` のような `sourceLight` 表現で由来の気配として扱う。
- キャラ名タイポグラフィ画像は大判キービジュアル上の右寄せ題字として使い、本文・読むページ内の見出しはテキストのまま維持する。

### 背景（`.th-backdrop`）と粗さ対策

背景は name-name のゲーム用 shadow-library 素材（`assets/images/shadow-library/*.webp`、build 時 `scripts/sync-assets.mjs` で `public/images/` に複製）を `object-fit: cover` で引き伸ばして流用（素材節約）。アップスケールの粗さを目立たせないため2層構成にする（name-name #316 の「平坦領域に階調＝高見え」を CSS で薄く適用）:

- **`.th-backdrop__base`**: `filter: blur(0.4px)`。グロー(overlay)の届かない暗い平坦部のアップスケールのドットを溶かす（0.4px は実機 A-B で確定。0.8px 以上はぼけすぎ）。
- **`.th-backdrop__glow`**: 同じ絵のぼかしコピー（`blur(7px)`）を `mix-blend-mode: overlay; opacity: 0.55` で重ね、平坦領域に階調を足して高見えさせる（soft-light は白霞み・暖色 tint は夕方色化で不採用＝#316 の結論）。
- `.th-backdrop::after` は文字可読性の弱いスクリム。**注意**: backdrop の z-index は `0`（負にすると body 背景色の下に潜る＝実機で絵が消える罠。コメント参照）。

### 住人の顔アップカード（`.th-face-crop--bust`）

- 全身立ち絵の兼用ではなく **LoRA 学習用のバストアップ絵**を使う（Issue #20「顔アップカード＝LoRA 元の顔アップ」）。素材は `docs/07_visual/lora-dataset/<char>/source-candidates/*_phase4-bust_neutral*.png` を選び、`magick`＋`cwebp` で `assets/images/<char>/bust.webp`（幅640・白背景のまま＝FF風のキャラアート）に変換。
- 顔位置は8体で揃える。マキヤは肩幅が広く引きの構図だったので顔中心にズームクロップ、ヒューは顔が右寄りだったので左マージンを削って左寄せ（縦長画像を1:1枠に cover すると横は全幅表示になり `object-position` の横が効かないため、元絵のクロップで調整する）。
- `bust.webp` はサイトのカード専用。name-name の立ち絵（`assets/images/<char>/normal.webp` 等）はプレイヤーが使うので消さない。

### 販促キービジュアル（Issue #35 / #38）

`assets/images/promotional/` をサイト採用版の置き場にする。元解像度・プロンプト・採否管理は #38 側で続け、サイトが読む軽量版だけをここへ置く。

- `promotional/cast/shadow-library-cast.webp`: トップ表紙と OGP に使う集合キービジュアル。
- `promotional/cast/shadow-library-reading-guide.webp`: トップページの本文背景に使う図版。first viewport の集合キービジュアルと同じ絵が下に続いて見えないよう、`index.astro` の `bgImage` はこれを指定する。
- `promotional/residents/<slug>-feature.webp`: 住人選択カードと住人詳細ページに使うキャラ別ワイド絵。2026-07-11 18:54:56〜19:02:07 の生成画像を古い順に `ou` → `makiya` → `hue` → `spino` → `dekaris` → `hegru` → `kantia` → `aristo` → `vincia` → `theo` と対応させた。
- `nameplates/{ja,en}/<slug>.webp`: キャラ名タイポグラフィ画像。キャラ別ページの大判キービジュアル上に重ねる題字として使う。本文・読むページ内の見出しはテキストのまま維持し、画像文字は記事内へ持ち込まない。将来の多言語化では同じ位置で `ja` / `en` を切り替える。

## OGP

`LibraryLayout.astro` が `og:image` に `promotional/cast/shadow-library-cast.webp` の絶対URL、`twitter:card: summary_large_image`（耽美キービジュアルが「本作の売り」＝delivery_platform.md）。

## 将来の余地（未実装・別Issue）

- 参戦ムービー導線: `ResidentCard.astro` に `<div data-slot="entrance-movie" hidden>` を `<a>` の外（兄弟）に用意済み（`<a>` 入れ子の interactive trigger は不正HTMLになるため）。
- 本編四幕（`/story`）・現代の問い（Issue #15）。

# assets/masters/ — 無劣化マスター（配信しない）

背景等の**無劣化マスター（高解像度 PNG）**を保管する。**ここは配信されない**（`/api/projects/<name>/assets/raw` が配信するのは `assets/images/` 配下）。

## 方針（kako-jun 確定 2026-06-24）
- **マスター = 無劣化・高解像度（PNG）** をここで管理する。
- **配信物 = 最適な解像度・品質**。背景は **WebP**（劣化済み）にして、無劣化マスター（PNG）と**フォーマットで一目で区別**できるようにする。
- 配信物は `assets/images/<category>/<name>.webp`。worker は 1 ファイル **1 MiB 未満**しか配信できない（Contents API 制限）ので、配信 WebP は 1 MiB 未満に最適化する。
- マスターを更新したら、同名の配信 WebP を `cwebp -q 82`（目安）で再生成する。

## 現状（shadow-library・2026-07-02 プレースホルダ卒業）
- マスター: `shadow-library/vertical/*.png`（25景・1024×1536・studio-yokonami#24で全採用）。
- 配信: `images/shadow-library/*.webp`（25景・各マスターと同名・`magick -quality 82`・143〜338KB）。旧プレースホルダ9種（3マスターの複製）は削除済み。
- 割当: ハブ＝`grand-reading-room-v` 固定／`main/`（住人おはこ8本）＝住人ごとに専用1景／`free/`（38業×住人）＝**業（テーマ）単位**で1景に統一（キャラ非依存の方針・studio-yokonami#24）。詳細は同Issueのコメントを参照。

## 現状（logo/icon・2026-07-05 確定ロゴ反映・Issue #32）
- マスター: `logo/theo-logo.png`（3000×1180・JA サブロゴ入り）/ `logo/theo-logo-en.png`（3000×842・英語のみ）/ `icon/theo-icon.png`（512×512・T字コンステレーション・不透明）。
- 透過処理: ロゴ2点は紺背景がほぼフラット（(1,6,20)近辺）なので色距離ベースの chroma key（`low=18, high=55` の feather）で抜いた。**高解像度（3000px）のまま透過してから縮小**（縮小してからの透過はエッジがギザつく）。アイコンは背景ごと使うので透過なし。
- 配信: `images/logo/theo-logo.webp`（1200×472・85KB）/ `images/logo/theo-logo-en.webp`（1200×337・65KB）。`cwebp -q 85 -alpha_q 100 -m 6`（立ち絵と同じ設定・透過エッジをロスレス保持）。アイコンは `assets/images/` を経由せず `public/favicon*.png` / `public/apple-touch-icon.png` を直接生成。
- 配線: JA ロゴ→ホーム(`index.astro`)ヒーロー画像。EN ロゴ→未配線（資産化のみ）。アイコン→favicon一式（`LibraryLayout.astro`）。

## 現状（nameplates・2026-07-12 キャラ名画像資産化・Issue #52）
- マスター: `nameplates/ja/*.png` / `nameplates/en/*.png`。元画像は背景つき PNG のまま保持する。
- 順番: `/Users/kako-jun/Downloads/text_ja` と `text_en` の更新時刻が古い順に、`theo`, `vincia`, `aristo`, `kantia`, `hegru`, `dekaris`, `spino`, `hue`, `makiya`, `ou` へ対応させた。
- 透過処理: ロゴ同様、四隅から濃紺背景色を推定し、色距離ベースの chroma key（`low=18, high=55` の feather）で抜く。**高解像度のまま透過してから**外接矩形を測定する。
- 正規化: 透過後の外接矩形を切り出し、コンテンツ高さを 420px、上下余白 40px、左右余白 56px に揃える。文字数が多い名前だけ小さく見えすぎないよう、キャンバス幅は名前ごとに可変とする。
- 配信: `assets/images/nameplates/{ja,en}/*.webp`。`npm run build-nameplates` で再生成する。`npm run sync-assets` により `public/images/nameplates/` へ同期される。

# 立ち絵の加工手順（再現可能・絵を作り直すたびに実行）

> **⚠️ 2026-07-01 更新: 本番方式が変わった。** 透過は下記の旧 erode+feather（Step 2）でなく、**BiRefNet_HR matte → 前景色 decontaminate → 暖色ランプのリムグロー(#FFDFB0)** にする。「白フチをゼロにする」競争はやめ、**図書館の光沢背景の反射光という設定で、立ち絵周囲に暖色の柔らかい光を乗せ離れるほど透明にフェード**させる（matte のアラを演出に変える）。生成時ネイティブ透過は Anima(Qwen系)に存在しないと確定済（出典: studio-yokonami #11）。
> - 本番スクリプト: `studio-yokonami/tools/tachie_finalize_birefnet.py`（matte+decontaminate+暖色グロー+trim+身長px を一括）。生成は `tools/gen_theo_tachie.py`。
> - 確定値: matte=BiRefNet_HR-matting(RES1024)/グロー色=#FFDFB0/sigma=10/gain=1.0。身長エンコードは下記 Step 3 のまま（K=4.09）。
> - 設計確定の経緯と blink 選定は studio-yokonami #11/#12、Theo 全13キー実例は #23。
> - 旧 Step 1（trim）と Step 3（身長エンコード）は現役。Step 2 は BiRefNet+グローに置換。

LoRA 等で立ち絵を作り直したら、毎回この手順で `assets/images/<char>/normal.png`（感情ごと `<char>/<emotion>.png`）を整える。name-name は立ち絵を**元絵基準の一律スケール `character_scale`（frontmatter `character_scale: 0.5`・name-name#378）** で表示する（個別縮小なし／#294）。よって **源画の縦ピクセル数がそのままキャラの身長**を表し、一律倍率なので背丈差（縦px比）がそのまま出る。足の裏を画面下端でそろえ上に伸びるので、源画を身長どおりに作れば背丈差が自動表現される。**画面基準の `character_height_ratio` は使わない**（表示高さを画面高に正規化＝源画の縦pxを割り消して身長差を潰す。2026-07-03 に character_height_ratio→character_scale へ是正）。

前提ツール: **ImageMagick 7**（`magick`）。この開発機では Rog/PIL 不要でこの加工はできる（高解像度の LoRA 再生成だけが Rog 依存）。

## 入力
- LoRA 出力の**全身立ち絵**（透過 PNG・rembg 済み想定）。キャラごと1枚（将来は感情ごと）。
- 各キャラの**身長(cm)**は `docs/02_characters/character_bible.md`「身長データ」表が正本。

## 手順（1キャラ＝3ステップ）

### Step 1. トリム（透明パディング除去＝足を下端に）
```
magick in.png -trim +repage trimmed.png
```
- LoRA 出力はキャラごとに**透明余白の量がバラバラ**（例: 同じ全身でも canvas 幅が 340〜512px と差が出る）。trim で実体の bbox に切り詰めると、幅は「キャラの実際の幅」になり、足が canvas 下端に来る。
- name-name は `anchor(0.5,1)＋characterY`（画面下端）で足を固定するので、**trim で足が下端に来れば全員の足元が自動でそろう**。

### Step 2. 白フチ除去（線を保ちつつ滑らかなアルファ）
```
magick trimmed.png -channel A -morphology Erode Octagon:1 -blur 0x0.6 +channel defringed.png
```
- rembg の白フチ（輪郭の半透明ピクセルに白が残る）対策。**アルファを 1px erode** して汚染リングを切り、`-blur 0x0.6` で**滑らかなグラデーションアルファ**にする（硬い2値にしない）。髪・薄布の細線は保持される実績あり。
- 設計意図（kako-jun）は「**黒地に置いてグラデーションアルファで抜く**」＝半透明エッジが白でなく黒へブレンドして白ハロを出さない。**opaque な源画から**作れるなら理想は black-matte premultiply（黒で合成→アルファ再付与）。今回は既に透過済み PNG しか無かったので erode+feather で近似し、実機で承認された。opaque 源画が得られたら black-matte 方式に切り替えてよい。

### Step 3. 身長エンコード（縦pxを身長に比例させる）
```
# target_px = round(身長cm × K)
magick defringed.png -resize x<target_px> assets/images/<char>/normal.png
```
- **係数 K = 4.09**。決め方: 「**最も背が高いキャラ（スピノ 184cm）の trim 後ネイティブ高さ ≒753px を保ち**、全員それ以下＝**ダウンスケールのみ**（アップスケール＝ボケ増を避ける）」よう、`K = (最長キャラの trim 後 px) / (最長キャラの cm)` で求めた。
  - 厳密には全キャラで `trim後px / cm` を出し、その**最小値**を K にすると誰もアップスケールされない（今回 ヘグル 745/182≒4.09 が最小だったので K=4.09）。
- これで `縦px = 身長cm × 4.09`。**各キャラの cm・縦px の対応表は `../02_characters/character_bible.md`「身長データ」表が唯一の正本**（数値の二重管理を避けるためここには再掲しない）。身長を変えたら bible の表だけを直し、同 K で源画を再計算する。

## 出力と表示
- finalize は `assets/images/<char>/normal.png`（感情追加時は `<char>/<emotion>.png`、**同じ身長pxで**書き出す＝感情で背丈が変わらない）を作る。ただし**これは中間物**。
- **配信用は webp に焼く（最終工程・必須）**。2倍解像度 PNG は 1〜2MB あり、name-name-api の **1ファイル 1 MiB 安全上限**（超えると 413 で立ち絵が出ない）を踏む。**寸法（身長px）はそのまま**に webp へ焼き、元 PNG は削除する（ムーブ）:
  ```bash
  cwebp -q 85 -alpha_q 100 -m 6 assets/images/<char>/<key>.png -o assets/images/<char>/<key>.webp
  ```
  - q85 固定（縮小表示前提でも 1 MiB に全く近づかないため画質は割り切らない）／alpha_q 100（透過エッジをロスレス保持）／m6（最良圧縮）／**リサイズしない**。実測で全立ち絵 112〜290KB に収まる（最重 spino/close=288KB・目標 ≤300KB）。
  - 参照側 name-name は `**Name** (char/key, 位置)` の**拡張子省略**参照を webp→png の順で解決する（name-name #376）。だから webp を置けば webp が使われる。
  - **正本は `studio-yokonami/LORA-PIPELINE.md`「立ち絵の webp 焼き＝配信フォーマット標準」節**（今後の全立ち絵・追加分も同一パラメータで焼く＝統一感）。**⚠️ PNG を消すのは name-name #376 が本番デプロイ済みを確認してから**（webp→png フォールバックの安全順序）。
- name-name は**元絵基準スケール `character_scale: 0.5` 表示**（#378）。配信 webp は Step 3 ネイティブ px の約2倍解像度なので、character_scale:0.5 で画面上ほぼネイティブ相当に戻しつつ縦px比（身長差）を保つ。幅が論理画面(9:16=450)を超えても**はみ出しOK**（個別縮小しない）。ToHeart 式に**下端（靴）が画面外に切れてよい**。

### 単体ポーズ差し替え時の注意

既存キャラの1ポーズだけを差し替える場合、finalize 出力をそのまま採用しない。ヒュー `observe` 追加時と同じく、既存ポーズ群の確定ジオメトリ（canvas 幅/高さ、足元、頭位置）へ厳密に合わせる。差し替え前後と同キャラ `normal` を `magick <file> -alpha extract -threshold 1%/5%/10%/50% -format "%@" info:` で比較し、低アルファの外周だけが広がっていないか確認する。

この工程で `GLOW_SIGMA` / `SIDE_M` / `TOP_M` を個別調整してはいけない。2倍解像度の住人立ち絵は全キャラ同一の `RES=1024 SIDE_M=80 TOP_M=104 GLOW_SIGMA=20` で finalize し、既存ジオメトリへの合わせ込みは透明キャンバスのパディングだけで行う。`refit_observe.py` のような `alpha>128` bbox crop + 固定余白の使い捨て処理は、低アルファの暖色グローを切るため再利用禁止。

既存85キーの head-align は PIL の `canvas.paste(img, (x, y), img)` で透明キャンバスに配置している。`alpha_composite` や ImageMagick `-composite` で置くと半透明ピクセルの RGB がランプ色のまま残り、黒背景で外周が不自然に明るく見える。Vincia `observe`（本を開いたT6採用）も同じ手順で、finalize 後の `50% bbox` を旧 observe の本体位置へ合わせるため `848x1560` 透明キャンバスに `+38+0` で `paste(..., mask=img)` 配置した。

再配置は使い捨てコマンドでなく `scripts/place-tachie-on-canvas.mjs` を使う。例:

```bash
node scripts/place-tachie-on-canvas.mjs \
  --input /path/to/finalize-out/observe.png \
  --output assets/images/vincia/observe.webp \
  --canvas 848x1560 \
  --offset 38,0
```

## 作り直し時の再現
1. 新しい LoRA 立ち絵を用意。
2. Step 1→2→3 を全キャラ実行（K=4.09 固定。身長を変えたら表と bible を更新して同 K で再計算）。
3. 最長キャラの源画ネイティブ高さが大きく変わったら K を再算出（`K = 最長trim後px / 最長cm`、ただし全キャラで最小の `trim後px/cm` を採る＝誰もアップスケールしない）。
4. dev `/play/theo-hayami` で足元そろい・背丈差・白フチ無しを blink 確認。

## 一括スクリプト例
```bash
declare -A CM=( [theo]=158 [hue]=168 [aristo]=170 [kantia]=172 [ou]=173 \
                [dekaris]=176 [vincia]=178 [makiya]=180 [hegru]=182 [spino]=184 )
K=4.09
for c in "${!CM[@]}"; do
  px=$(python3 -c "print(round(${CM[$c]}*$K))")   # uv run python3 でも可
  magick "src/$c.png" -trim +repage \
    -channel A -morphology Erode Octagon:1 -blur 0x0.6 +channel \
    -resize x$px "assets/images/$c/normal.png"
done
```
（`src/` は LoRA 出力置き場。bash は zsh では `${!CM[@]}` 連想配列が使える。**CM 値は `../02_characters/character_bible.md` 身長表が正本＝この配列は実行用の写し。表を変えたらここも合わせる。**）

関連: name-name #294（個別縮小しない＋フィットオプション）/ **#378（元絵基準の一律スケール `character_scale`＝身長差保存。画面基準 `character_height_ratio` は身長差を潰す）**, studio-yokonami #10（源画整備）/#11（白フチ）/#12（感情立ち絵）, `character_bible.md`（身長データ正本）。

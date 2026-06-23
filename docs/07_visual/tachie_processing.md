# 立ち絵の加工手順（再現可能・絵を作り直すたびに実行）

LoRA 等で立ち絵を作り直したら、毎回この手順で `assets/images/<char>/normal.png`（将来は感情ごと `<char>/<emotion>.png`）を整える。name-name は**立ち絵を原寸表示**する（個別縮小なし／name-name #294）。よって **源画の縦ピクセル数がそのままキャラの身長**を表す。足の裏を画面下端でそろえ上に伸びるので、源画を身長どおりに作れば背丈差がそのまま出る。

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
- これで `縦px = 身長cm × 4.09`。例（2026-06-23 時点）:

| char | cm | 縦px | char | cm | 縦px |
|--|--|--|--|--|--|
| seo | 158 | 646 | dekaris | 176 | 720 |
| hue | 168 | 687 | vincia | 178 | 728 |
| aristo | 170 | 695 | makiya | 180 | 736 |
| kantia | 172 | 703 | hegru | 182 | 744 |
| ou | 173 | 708 | spino | 184 | 753 |

## 出力と表示
- `assets/images/<char>/normal.png`（感情追加時は `<char>/<emotion>.png`、**同じ身長pxで**書き出す＝感情で背丈が変わらない）。
- name-name 原寸表示。幅が論理画面(9:16=450)を超えても**はみ出しOK**（縮小しない）。ToHeart 式に**下端（靴）が画面外に切れてよい**。

## 作り直し時の再現
1. 新しい LoRA 立ち絵を用意。
2. Step 1→2→3 を全キャラ実行（K=4.09 固定。身長を変えたら表と bible を更新して同 K で再計算）。
3. 最長キャラの源画ネイティブ高さが大きく変わったら K を再算出（`K = 最長trim後px / 最長cm`、ただし全キャラで最小の `trim後px/cm` を採る＝誰もアップスケールしない）。
4. dev `/play/theo-hayami` で足元そろい・背丈差・白フチ無しを blink 確認。

## 一括スクリプト例
```bash
declare -A CM=( [seo]=158 [hue]=168 [aristo]=170 [kantia]=172 [ou]=173 \
                [dekaris]=176 [vincia]=178 [makiya]=180 [hegru]=182 [spino]=184 )
K=4.09
for c in "${!CM[@]}"; do
  px=$(python3 -c "print(round(${CM[$c]}*$K))")   # uv run python3 でも可
  magick "src/$c.png" -trim +repage \
    -channel A -morphology Erode Octagon:1 -blur 0x0.6 +channel \
    -resize x$px "assets/images/$c/normal.png"
done
```
（`src/` は LoRA 出力置き場。bash は zsh では `${!CM[@]}` 連想配列が使える。）

関連: name-name #294（原寸表示＋フィットオプション）, studio-yokonami #10（源画整備）/#11（白フチ）/#12（感情立ち絵）, `character_bible.md`（身長データ正本）。

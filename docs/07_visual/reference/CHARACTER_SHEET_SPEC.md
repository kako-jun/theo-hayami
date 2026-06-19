# キャラクターシート仕様

LoRA 合成前に、全キャラについて `seo-hayami` の例と同程度のキャラクターシートを作る。

## 目的

単体の顔や立ち絵だけで判断すると、LoRA 合成後に衣装・表情・横顔・背面・小物が破綻しても気づきにくい。先に全キャラのシートを揃え、人格化名・能力・口調・ビジュアルの対応を固定する。

## 必須要素

1. 大きい全身立ち絵
2. プロフィール欄
3. 表情差分 4点以上
4. FRONT / SIDE / BACK の三面図
5. 衣装・小物の特徴
6. 出会う哲学者たち、または関係する相手のシルエット
7. そのキャラの問い・台詞の核

## 作成順

1. `seo-hayami` のシートを基準にする。
2. 10人カードから採用できる方向性を拾う。
3. 各キャラのシートを個別生成する。
4. シート単位でライブ blink / A-B し、顔・表情・衣装の方向性を決める。
5. その後に LoRA 合成へ進む。

## 採用判断

- 10人が同じ顔に平均化していない。
- 目、眉、口元、姿勢、手つきがキャラごとに違う。
- 服だけでなく、思考態度が出ている。
- カメラ目線の微笑みやホスト文法に寄っていない。
- 口調・能力名と矛盾していない。

## ファイル配置

各キャラの完成シートは次に置く。

```text
docs/07_visual/reference/01_character-designs/{character}/YYYYMMDD_{character}_character-sheet_vNN.png
```

シートから切り出した参照画像は同じフォルダに置く。

```text
YYYYMMDD_{character}_fullbody_vNN.png
YYYYMMDD_{character}_expressions_vNN.png
YYYYMMDD_{character}_turnaround_vNN.png
YYYYMMDD_{character}_costume-props_vNN.png
```

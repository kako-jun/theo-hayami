# Character Image Selection and LoRA Dataset Plan

このファイルは、ChatGPT Images2 で生成したキャラ画像を **master / secondary / rejected** に分け、master から LoRA 学習用画像集を量産するための正本。

## 目的

- 画像を同格の候補として放置しない。
- 各キャラの identity reference を1つに決める。
- 二軍画像を捨てず、衣装・背面・姿勢・イベント絵用 reference として使う。
- 完全不採用画像を混ぜない。LoRA 学習にも ChatGPT Images2 の reference にも入れない。
- LoRA 学習用画像集は、master を起点にして同一人物性を守ったまま量産する。

## 分類

### master

各キャラ1枚だけ。以後の正本 identity。

用途:

- LoRA 学習用の量産元。
- ChatGPT Images2 でイベント絵・販促絵・表情/ポーズ差分を作るときの最優先 reference。
- 立ち絵の顔・髪・体格・色・視覚署名の正本。

条件:

- そのキャラだと一目で分かる。
- `character_bible.md` の視覚署名が入っている。
- 顔・髪・服・体格・色が破綻していない。
- カメラ目線の媚び、BL/ホスト文法、平均青年顔に寄りすぎていない。
- 他キャラと目・髪型・姿勢が被らない。

### secondary

使えるが identity 正本ではない画像。

用途:

- 衣装構造、背面、横顔、姿勢、小物、手元の reference。
- イベント絵や販促絵の ChatGPT Images2 reference 補助。
- LoRA 学習の直接入力には原則使わない。ただし master 由来の量産後、衣装や背面の補強が必要な場合だけ追加検討する。

### rejected

完全不採用。学習にも reference にも使わない。

条件:

- 別人化している。
- 視覚署名が消えている。
- 複数人/複数立ち絵事故がある。
- 版権キャラに寄りすぎている。
- セクシー・ホスト・アイドル文法が強い。
- LoRA に混ぜると identity を壊す。

保管先:

- 原則 `../90_rejected/` へ移す。
- なぜ不採用かを `.md` で短く残す。

## Master Selection

2026-06-30 時点の横並び確認による選別。master は各キャラ1枚だけ。

| character | master | secondary | rejected / do not use | note |
|---|---|---|---|
| theo | `theo/20260630_theo_chatgpt-generated-visual-signature-priority_v01.png` | `theo/20260630_theo_chatgpt-generated-candidate_v01-v04.png`, `theo/20260630_theo_heterochromia-contact-sheet_v01.png` | none | オッドアイ成功版を master。contact sheet は直接素材でなく参考。 |
| ヴィンチア | `vincia/20260630_vincia_chatgpt-generated-4view-priority_v01.png` | `vincia/20260630_vincia_chatgpt-generated-4view-priority_v02-v04.png`, `vincia/20260630_vincia_chatgpt-generated-candidate_v01-v04.png` | none | front の v01 を master。旧 candidate は姿勢/衣装 reference。 |
| アリスト | `aristo/20260630_aristo_chatgpt-generated-4view-priority_v01.png` | `aristo/20260630_aristo_chatgpt-generated-4view-priority_v02-v04.png`, `aristo/20260630_aristo_chatgpt-generated-candidate_v01-v04.png` | none | front の v01 を master。 |
| カンティア | `kantia/20260630_kantia_chatgpt-generated-visual-signature-priority_v01.png` | `kantia/20260630_kantia_chatgpt-generated-candidate_v01-v04.png` | none | 眼光はまだ弱いが、現状では最も signature を意識した版。イベント/LoRA量産時に鋭さを再補強する。 |
| ヘグル | `hegru/20260630_hegru_chatgpt-generated-4view-priority_v01.png` | `hegru/20260630_hegru_chatgpt-generated-4view-priority_v02-v04.png`, `hegru/20260630_hegru_chatgpt-generated-candidate_v01-v04.png` | none | front の v01 を master。 |
| デカリス | `dekaris/20260630_dekaris_chatgpt-generated-visual-signature-priority_v01.png` | `dekaris/20260630_dekaris_chatgpt-generated-candidate_v01-v04.png` | none | 暗い目元・懐疑の雰囲気を優先。 |
| スピノ | `spino/20260630_spino_chatgpt-generated-4view-priority_v01.png` | `spino/20260630_spino_chatgpt-generated-4view-priority_v02-v04.png`, `spino/20260630_spino_chatgpt-generated-candidate_v01-v04.png` | none | front の v01 を master。スピノはこれ以上いじらない。 |
| ヒュー | `hue/20260630_hue_chatgpt-generated-visual-signature-priority_v02.png` | `hue/20260630_hue_chatgpt-generated-visual-signature-priority_v01.png`, `hue/20260630_hue_chatgpt-generated-candidate_v01-v04.png` | none | v02 は立ち絵 master 向き。v01 は座り絵/イベント reference 向き。 |
| マキヤ | `makiya/20260630_makiya_chatgpt-generated-master-priority_v01.png` | `makiya/20260630_makiya_chatgpt-generated-candidate_v02-v04.png` | `makiya/20260630_makiya_chatgpt-generated-visual-signature-priority_v01.png` | 旧 candidate_v01 を master-priority 名へ昇格。白背景・全身・刈り上げ明瞭。visual-signature-priority は右端に別カット断片が入るため混ぜない。 |
| オウ | `ou/20260630_ou_chatgpt-generated-visual-signature-priority_v01.png` | `ou/20260630_ou_chatgpt-generated-candidate_v01-v04.png` | none | 片目開眼版を master。 |

## Physical File Policy

現時点では master / secondary / rejected を物理移動しない。理由:

- 既存パスを reference として Issue / docs から参照している。
- 同じ画像を `master/` にコピーすると二重管理になる。
- 分類はこの manifest を正本にする。

LoRA 学習用に採用した画像だけ、後段で `docs/07_visual/lora-dataset/<character>/source/` にコピーする。この dataset 側は「実際に食わせる入力」なので重複ではなく成果物として扱う。

## LoRA 用画像集の作り方

### 原則

- LoRA 学習はキャラごとに分ける。統合 LoRA にしない。
- ChatGPT Images2 には master を最優先 reference として渡す。
- secondary は衣装・背面・小物の補助 reference として必要な場合だけ足す。
- rejected は絶対に入れない。
- 量産画像は「1画像=1人」だけ。4人入り sheet をそのまま学習に使わない。
- 4ビュー sheet を使う場合は、等分スライスしてから使う。
- caption に `turnaround` / `character sheet` / `full body turnaround` を書かない。
- 身長・体格は `docs/02_characters/character_bible.md` の身長データを正本とする。生成プロンプトでは「縦長キャンバス」を人物の脚長・高身長として解釈させない。採用後は足元基準で trim し、同表の `立ち絵 縦px` にリサイズする。

### 1キャラあたりの最小セット

まずは 12-20 枚を目安にする。

- master front: 1
- full body: front / 3/4 left / side / back: 4
- upper body bust: neutral / serious / soft / surprised: 4
- expression: neutral / thinking / speaking / troubled / resolved: 5
- pose variation: standing relaxed / reading / holding prop / slight turn: 4
- outfit state: normal / open-front: 必要なら各2-4

### ChatGPT Images2 での量産手順

1. master 1枚を reference にする。
2. 必要なら secondary から衣装背面・小物 reference を1-3枚追加する。
3. 一度に4枚ずつ生成する。ただし「4候補」なのか「4ビュー」なのかを明示する。
4. 良い出力だけを dataset source に採用する。
5. 採用画像は `solo, single person` で caption する。

4ビューを作る場合:

```text
Using the attached master image as the exact same character identity, generate 4 images at once as a consistent character reference set.

All images must depict the EXACT SAME SINGLE CHARACTER.
Maintain identical face, hairstyle, body build, visual signature, costume, accessories, and color palette.
Do NOT redesign or reinterpret the character.
Keep the character's natural body proportions and height impression from the project height chart. Do NOT elongate the body, legs, neck, or head-to-body ratio. A vertical canvas is allowed, but the person must not become taller than their assigned character height.

Each image must be a full-body standing illustration with feet visible.
Each image must show a different angle:
1. front view
2. 3/4 view (left)
3. side view
4. back view

Plain pure white background. No text. No UI panels. No other people.
```

表情/ポーズ4候補を作る場合:

```text
Using the attached master image as the exact same character identity, generate 4 separate candidate images of the SAME SINGLE CHARACTER.

Keep the same face, hairstyle, body build, visual signature, costume, accessories, and color palette.
Only vary expression and small pose.
Keep the character's natural body proportions and height impression from the project height chart. Do NOT elongate the body, legs, neck, or head-to-body ratio.

Create four variants:
1. neutral standing
2. thinking / inward
3. speaking / explaining
4. troubled or resolved

Plain pure white background. Full body or upper body, as requested. No text. No UI panels. No other people.
```

### 保存先案

LoRA 学習用に採用した画像は、reference 候補とは別に置く。

```text
docs/07_visual/lora-dataset/
  <character>/
    source/
      0001.png
      0001.txt
      0002.png
      0002.txt
    rejected/
      ...
```

`source/` は実際に LoRA に食わせるものだけ。候補や迷いは入れない。

## イベント絵 / 販促絵での使い方

イベント絵や販促絵は LoRA ではなく ChatGPT Images2 で作る可能性が高い。その場合も分類は同じ。

- master: 必ず入れる identity reference。
- secondary: 衣装・背面・小物・表情の補助として必要なものだけ入れる。
- rejected: 入れない。

イベント絵生成では、master を入れたうえで `do not redesign the character` を強く指定する。複数キャラ絵では、キャラごとに master を1枚ずつ渡し、配置・視線・手元・背景はテキストで指定する。

イベント絵は立ち絵の延長ではなく、場面の途中を切り取ったスチルとして作る。全身直立・中央配置・キャラ紹介ポーズ・character-sheet 風の整い方は、identity が合っていても不採用。スナップ的な見切れ、顔/手元/背中越し/机上への寄り、斜め視線、立ち絵にない表情、前景ボケや暗部で作るテキスト余白を優先する。同じ向き・同じ距離・同じ高さの構図が続く場合も再生成理由にする。

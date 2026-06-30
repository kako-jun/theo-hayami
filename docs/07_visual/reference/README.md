# 画像リファレンス

theo-hayami のキャラクターデザイン、舞台、キービジュアル候補の画像置き場。

生成した大きなキャラシートや舞台シートは、まず `00_source-sheets/` に元画像のまま置く。その後、参照しやすい単位に切り出して `01_character-designs/`、`02_stage-designs/`、`03_key-visuals/` に分ける。

## ディレクトリ

| パス | 用途 |
|---|---|
| `00_source-sheets/` | 生成直後の未加工シート。比較・再切り出し用の保険 |
| `01_character-designs/` | キャラ単位に分割した立ち絵・表情・衣装案 |
| `02_stage-designs/` | 影の図書館など、舞台・背景・画面空間の案 |
| `03_key-visuals/` | `key_visuals.md` の6点に対応する候補 |
| `90_rejected/` | 没。後で「なぜ違うか」を確認するため残す |

## 重要な制作ルール

- キャラは LoRA 合成前に、全員 `CHARACTER_SHEET_SPEC.md` 相当のシートを作る。
- 背景は小さいシート切り出しを最終素材にしない。採用候補は `BACKGROUND_IMAGE_SPEC.md` に従って単体高解像度で作り直す。

## 命名規則

基本形:

```text
YYYYMMDD_subject_kind_vNN.ext
```

例:

```text
20260619_theo_face_v01.webp
20260619_shadow-library_wide_v02.png
20260619_source_character-sheet_v01.png
```

- `subject` は下のフォルダ名に合わせる。
- `kind` は `face`、`fullbody`、`expression`、`costume`、`wide`、`interior`、`lighting` など。
- 採用候補は `vNN` を進める。単なる切り出し違いは `cropNN` を足す。
- 生成プロンプトや判断メモが必要な画像は、同名の `.md` を横に置く。

## 分割ルール

1. 元画像は削らず `00_source-sheets/` に保存する。
2. 使える部分だけをキャラ・舞台・キービジュアルに切り出す。
3. 似ている候補は1枚にまとめず、比較できるよう別ファイルにする。
4. 露骨に違う案も、学習になるものは `90_rejected/` に移す。
5. 採用判断は静止画の思い込みで決めず、必要ならライブ blink / A-B で見る。

## キャラ対応

| フォルダ | 対象 |
|---|---|
| `theo/` | 主人公theo |
| `vincia/` | ヴィンチア |
| `aristo/` | アリスト |
| `kantia/` | カンティア |
| `hegru/` | ヘグル |
| `dekaris/` | デカリス |
| `spino/` | スピノ |
| `hue/` | ヒュー |
| `makiya/` | マキヤ |
| `ou/` | オウ |

キャラ絵の採用時は、口調・口癖・能力名も `docs/02_characters/character_bible.md` または制作層の該当ドキュメントへ反映する。

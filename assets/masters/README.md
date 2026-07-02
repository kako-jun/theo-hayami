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

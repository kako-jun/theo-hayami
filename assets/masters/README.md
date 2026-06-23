# assets/masters/ — 無劣化マスター（配信しない）

背景等の**無劣化マスター（高解像度 PNG）**を保管する。**ここは配信されない**（`/api/projects/<name>/assets/raw` が配信するのは `assets/images/` 配下）。

## 方針（kako-jun 確定 2026-06-24）
- **マスター = 無劣化・高解像度（PNG）** をここで管理する。
- **配信物 = 最適な解像度・品質**。背景は **WebP**（劣化済み）にして、無劣化マスター（PNG）と**フォーマットで一目で区別**できるようにする。
- 配信物は `assets/images/<category>/<name>.webp`。worker は 1 ファイル **1 MiB 未満**しか配信できない（Contents API 制限）ので、配信 WebP は 1 MiB 未満に最適化する。
- マスターを更新したら、同名の配信 WebP を `cwebp -q 82`（目安）で再生成する。

## 現状（shadow-library・暫定プレースホルダ）
- マスター: `shadow-library/{grand-reading-room,dream-corridor,forbidden-room}.png`（1024×1536 等・2〜3MB）。
- 配信: `images/shadow-library/*.webp`（9シーン名・3マスターから生成・165〜349KB）。
- 最終の個別7背景は studio-yokonami で生成し、マスター(PNG)＋配信(WebP)を同名で差し替える。

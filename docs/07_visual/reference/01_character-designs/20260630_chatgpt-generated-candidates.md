# 2026-06-30 ChatGPT generated character candidates

`/Users/kako-jun/Downloads/theo` および `freeza/input/theo` に置かれた 10 キャラ分の ChatGPT 生成絵を、採用前の高解像度リファレンスとして保管した。

## Scope

- 対象: theo / ヴィンチア / アリスト / カンティア / ヘグル / デカリス / スピノ / ヒュー / マキヤ / オウ
- 枚数: 64 枚
- 解像度:
  - theo / カンティア / ヘグル / デカリス / オウ: おおむね 1024x1536
  - ヴィンチア / アリスト / ヒュー / マキヤ: おおむね 1086x1448
  - スピノ: おおむね 1055x1491 または 1086x1448
- 置き場: `docs/07_visual/reference/01_character-designs/<character>/20260630_*`

## Assessment

- 目標だった「theoのオッドアイ」「リヴァイ / L のような表情・目元の署名」は、多くの出力では弱い。
- これらの狙い自体は既にリポジトリへコミット済みの正本プロンプト/設計（`docs/07_visual/reference/IMAGE_PROMPTS.md`、`docs/02_characters/character_bible.md`）に入っていた。したがって、単なる生成偶然ではなく、既存プロンプトが ChatGPT Images に対して十分に効かなかった実例として扱う。
- theoは 1 枚だけオッドアイが入ったが、複数立ち絵が 1 枚にまとまった contact sheet 形式で、直接の立ち絵素材ではない。
- ただし、背面アングルや高解像度の衣装・髪型・姿勢リファレンスとしては価値があるため、捨てずに保管する。
- ヴィンチア / アリスト / ヘグル / スピノの 4 キャラは、最初に `20260630_<char>_chatgpt-generated-candidate_v01-v04.png` として 4 候補ずつ保管した。
- その後、`front / 3/4 left / side / back` の4ビュー固定プロンプトで作り直した版を `20260630_<char>_chatgpt-generated-4view-priority_v01-v04.png` として追加保管した。**この4view-priority版を優先素材**とし、旧 candidate 版は比較・衣装/姿勢 reference として残す。
- theo / デカリス / ヒュー / カンティア / マキヤ / オウは、視覚署名リトライ版を `20260630_<char>_chatgpt-generated-visual-signature-priority_vNN.png` として追加保管した。これは通常 candidate より優先して確認する。ヒューのみ2枚。
- マキヤは `visual-signature-priority_v01` の右端に別カット断片が入ったため、旧 `candidate_v01` を `20260630_makiya_chatgpt-generated-master-priority_v01.png` にリネームして master 扱いにした。

## Decision Needed

この素材群は、studio-yokonami 側の Issue で次のいずれかを決める。

- Decision issue: <https://github.com/kako-jun/studio-yokonami/issues/16>

1. プロンプトを改善して、同じ 6 キャラで再生成する。
2. ここで打ち切り、既存候補はアングル/衣装リファレンスとしてのみ使う。
3. 残りキャラにも同様の高解像度アングル版を作り、全員分の reference を揃える。=> 2026-06-30 にヴィンチア / アリスト / ヘグル / スピノを追加し、10 キャラ分は揃った。さらに同日、4ビュー固定で作り直した優先版を4人ぶん追加し、対象4キャラは旧候補4枚 + 新4view-priority4枚の各8枚になった。theo / デカリス / ヒュー / カンティア / マキヤ / オウには視覚署名リトライ版も追加した。

再生成する場合は、新規プロンプトを作るだけでなく、既存正本プロンプトのどの指定が効かなかったかを分解し、キャラ別に「必須視覚署名」「禁止崩れ」「参照画像の渡し方」を書き直す。

採用立ち絵へ直接差し替える作業ではない。採用する場合は、白フチ透過・足元ベースライン・縦 px 統一・表情差分の既存制作フローに通す。

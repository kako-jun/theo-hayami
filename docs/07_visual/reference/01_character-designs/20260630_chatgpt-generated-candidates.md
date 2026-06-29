# 2026-06-30 ChatGPT generated character candidates

`/Users/kako-jun/Downloads/theo` に置かれた 6 キャラ分の ChatGPT 生成絵を、採用前の高解像度リファレンスとして保管した。

## Scope

- 対象: せおはやみ / オウ / カンティア / デカリス / ヒュー / マキヤ
- 枚数: 25 枚
- 解像度:
  - せおはやみ / オウ / カンティア / デカリス: おおむね 1024x1536
  - ヒュー / マキヤ: 1086x1448
- 置き場: `docs/07_visual/reference/01_character-designs/<character>/20260630_*`

## Assessment

- 目標だった「せおのオッドアイ」「リヴァイ / L のような表情・目元の署名」は、多くの出力では弱い。
- これらの狙い自体は既にリポジトリへコミット済みの正本プロンプト/設計（`docs/07_visual/reference/IMAGE_PROMPTS.md`、`docs/02_characters/character_bible.md`）に入っていた。したがって、単なる生成偶然ではなく、既存プロンプトが ChatGPT Images に対して十分に効かなかった実例として扱う。
- せおは 1 枚だけオッドアイが入ったが、複数立ち絵が 1 枚にまとまった contact sheet 形式で、直接の立ち絵素材ではない。
- ただし、背面アングルや高解像度の衣装・髪型・姿勢リファレンスとしては価値があるため、捨てずに保管する。

## Decision Needed

この素材群は、studio-yokonami 側の Issue で次のいずれかを決める。

- Decision issue: <https://github.com/kako-jun/studio-yokonami/issues/16>

1. プロンプトを改善して、同じ 6 キャラで再生成する。
2. ここで打ち切り、既存候補はアングル/衣装リファレンスとしてのみ使う。
3. 残りキャラにも同様の高解像度アングル版を作り、全員分の reference を揃える。

再生成する場合は、新規プロンプトを作るだけでなく、既存正本プロンプトのどの指定が効かなかったかを分解し、キャラ別に「必須視覚署名」「禁止崩れ」「参照画像の渡し方」を書き直す。

採用立ち絵へ直接差し替える作業ではない。採用する場合は、白フチ透過・足元ベースライン・縦 px 統一・表情差分の既存制作フローに通す。

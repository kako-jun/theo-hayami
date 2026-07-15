# 業ボタン象徴画像スペック（Issue #73 / #76）

業ボタン（悩み選択の扉）に敷く、業を象徴する生成画像の仕様。全38業ぶん生成済み（2026-07-15時点）。今後、業が増えたり画像を作り直したりする時に、この仕様に従えば既存画像群と画風・構図が揃う。

## 置き場・実装

- 正本: `assets/images/theme-symbols/{slug}.webp`（git管理・`scripts/sync-assets.mjs` が `public/images/` に複製）
- 判定: `src/lib/scripts.ts` の `themeSymbolImage(slug)` が `existsSync` でファイルの実在を見るだけ。ハードコード許可リストではないので、画像を置くだけで自動的に反映される（コード変更不要）
- 使用箇所: `src/components/ThemeCard.astro`（業から選ぶ・集計扉）、`src/pages/residents/[character].astro`（住民→業・個別扉）の2箇所のみ。`ResidentCard.astro` や `themes/[theme].astro` の住民選択カードには使わない（別の意匠系統）
- CSS: `src/styles/global.css` の `.th-door--symbol`（`background-size:cover; background-position:center top;` の上端基準クロップ + `::after` の下方向暗幕グラデーション）

## 画風（全画像共通・厳守）

- 半写実アニメ塗り（セル画寄り、フラットベクターにしない）
- インク黒背景 `#0a0910` 付近
- 金の線画 `#b8934f`（ベース）/ `#e6c47e`（明るいハイライト）
- アイボリーのハイライト `#fff6e6`
- ゴシック幻想図書館「叡智の星海」の雰囲気: 書架・アーチ窓・浮遊する金の粒子を背景に薄く配置（右側〜背景に寄せる）
- 人物を描く場合は**完全に顔・表情のない中性的なシルエット**（目・鼻・口・髪の描写一切なし。年齢・性別が判別できないこと）。特定のキャラクターに見えてはいけない
- 枠線・ロゴ・アーティスト署名は入れない
- 英単語1語を淡い透かし文字（15〜20%不透明度、エレガントなセリフ体）としてどこかに統合。**日本語文字は一切入れない**（漢字は英語圏で読めないため、悩みの概念を表す英単語に統一する）

## 構図ルール（最重要・kako-jun実機フィードバックで確定）

1. **絵の主体は画面の左1/3〜左半分に収め、中央から右側は比較的何もない暗い余白にする。**
   理由: ボタンには日本語タイトル文字が上部中央に重ねて表示される。`.th-door` は `display:block; text-align:center;` なので、タイトル`<p>`はボタン上部（padding-top直後）に中央揃えで乗る。主体を画面中央に置くと、この上部中央のタイトルと絵の一番目立つ部分が正面衝突し、読みにくくなる（実際に9枚がこれで作り直しになった。教訓は下記「よくある失敗」参照）。
2. **画像下1/3は無地の暗幕**（線画・粒子・文字なし、なめらかに暗くなるだけ）。理由: `background-position: center top` の上端基準クロップにより、集計扉（高い）と個別扉（低い）で同じ1枚を使い回す。低い扉では下部がより多く削れるだけで絵と文字が保たれるようにするため。
3. 主体（人物シルエット等）の実際の高さは、画像の**上60%以内**に収めるとなお安全（低い扉でのクロップ耐性が上がる）。
4. サイズ指定は `1536x512`（3:1横長バナー）、quality high。**gpt-image-2の内蔵ツールは指定通りの1536x512ではなく `2172x724`（同じ3:1比率）で返すことが多い** — これは既知の挙動で、ローカルでリサイズ・再構成しない（捏造禁止の指示に反する）。既存38枚も全て2172x724系統に揃っている。

## よくある失敗（作り直しになった実例）

- **主体を画面中央に置いた**（shihai/shuuchaku/ronpa/ai/yurushi/namake/kitai/fukushuu/ikari の9枚が該当し全て左寄せに作り直した）。プロンプトで「left one-third to left-half」を明記するだけでなく、「center-right two-thirds must stay empty」も併記しないと、モデルが中央配置に寄せがち。
- **人数の多い群像（douchou、当初19体）が画面全幅に広がった**。左寄せにしようがないので、人数を5〜6体に減らして構図ごと作り直した。
- **主体の裾・鎖・反射などが下1/3の暗幕帯に侵食する**（jikan、gensou、kitaiで発生）。「主体は上60%以内」を明記して再生成すると解消する。

## 業ごとの割り当て（英単語 / 象徴、全38業）

### 欲・むさぼり
| slug | 業 | 英単語 | 象徴 |
|---|---|---|---|
| moke | 損得で動いてしまう | SCALES | 傾いた天秤 |
| netami | 人がうらやましい | ENVY | 星に手を伸ばすシルエット |
| gouman | つい人を見下してしまう | PRIDE | 高い場所から見下ろすシルエット |
| shihai | 思いどおりにしたい | CONTROL | 操り糸を握る手 |
| shuuchaku | どうしても手放せない | CLING | しおれた花を抱きしめる手 |
| izon | やめたいのにやめられない | TETHER | 鎖でつながれたシルエット |
| namake | つい後回しにしてしまう | DELAY | 砂時計＋背を向けるシルエット |
| mie | よく見られたい | VANITY | 鏡に向かうシルエット |

### 対人
| slug | 業 | 英単語 | 象徴 |
|---|---|---|---|
| ronpa | 言い負かしたい | RHETORIC | 向き合う2つの刃 |
| uso | 本当の自分がわからない | MASK | 仮面を持つシルエット |
| kodoku | ひとりがさみしい | SOLITUDE | 膝を抱えてうずくまるシルエット |
| ai | 好きで苦しい | ACHE | 茨に包まれたハート状の光 |
| fushin | 人を信じられない | DOUBT | 光の格子の向こうのシルエット |
| yurushi | どうしても許せない | GRUDGE | 石を握りしめる拳 |
| douchou | つい周りに合わせてしまう | CONFORM | 同一シルエット5〜6体、1体だけ異なる |
| kitai | 期待してしまう | HOPE | 低い姿勢で地平の光に手を伸ばすシルエット |
| fukushuu | 仕返ししたい | REVENGE | 刃のように光る鏡の破片 |

### 感情
| slug | 業 | 英単語 | 象徴 |
|---|---|---|---|
| ikari | 感情に振り回される | STORM | 渦巻く風と葉の中のシルエット |
| fuan | この先が不安だ | UNEASE | 霧の崖の縁に立つシルエット |
| koukai | あのときこうしていれば | REGRET | 消えかけた足跡を振り返るシルエット |
| taikutsu | なにもかもつまらない | TEDIUM | 同じ歯車模様に囲まれたシルエット |
| soushitsu | 失って立ち直れない | LOSS | 空の椅子としおれた花 |
| zaiakukan | 自分を責めてしまう | GUILT | 自分の影の鎖に膝をつくシルエット |
| aseri | 置いていかれる気がする | BEHIND | 遠ざかる光の列を見送るシルエット |

### 生きること
| slug | 業 | 英単語 | 象徴 |
|---|---|---|---|
| shi | 消えるのが怖い | VANISH | 粒子となって溶けていくシルエット |
| oi | 歳をとりたくない | AGE | 蕾・満開・枯れの3段階の花 |
| imi | 何のために生きるんだろう | MEANING | 開いた本の前に佇むシルエット |
| jiyuu | 自分で選んでいるのかわからない | CHOICE | 分かれ道の前に立つシルエット |
| koufuku | しあわせって何だろう | HAPPINESS | 小さな光を包む両手 |
| jikan | 過ぎた時間にとらわれてしまう | TIME | 時計の針・砂時計の鎖に絡まるシルエット |
| henka | 変わりたいのに変われない | CHRYSALIS | 繭の中で翅が開かないシルエット |

### 認識・知
| slug | 業 | 英単語 | 象徴 |
|---|---|---|---|
| mujun | どちらも選べない | DILEMMA | 2つの扉の間に立つシルエット |
| wakattete | わかっているのに動けない | INERTIA | 足元から根が伸びるシルエット |
| gensou | 何が現実かわからない | ILLUSION | 波打つ水面に歪んで映るシルエット |
| tadashisa | 何が正しいのかわからない | COMPASS | 針が定まらない羅針盤 |
| mayoi | 迷ってばかりで決められない | MAZE | 金の細線迷路の中のシルエット |
| atarimae | 当たり前を疑えない | UNSEEN | 目を覆う薄い帳をまとうシルエット |
| wakeru | 人を決めつけてしまう | LABEL | 硬い幾何学の枠に閉じ込められたシルエット |

## 生成方法（新しい業を追加する時の手順）

freeza リポの `image` スキル（`.claude/skills/image/SKILL.md`）の「Claude 経路」に従う。

```bash
mkdir -p /tmp/theo-hayami-symbol-gen/{slug}
cd /tmp/theo-hayami-symbol-gen/{slug} && codex exec -s danger-full-access --skip-git-repo-check -c model_reasoning_effort="high" \
  "Invoke the \$imagegen skill and use the built-in image_gen tool at the HIGHEST quality (quality: high) and size 1536x512 to create the image described, then save the REAL generated PNG (decode the tool result) into the current workspace at {slug}.png. You are STRICTLY FORBIDDEN from fabricating/drawing the image with magick/ImageMagick/PIL/Pillow/numpy/SVG/canvas/any code; only the image_gen tool. If the image_gen tool is genuinely not in your toolset, do NOT fabricate — output exactly: IMAGE_GEN_TOOL_UNAVAILABLE. Report the saved file path.

<英語プロンプト。scene/subject/text/composition rule/constraintsの順で、上記の画風・構図ルールをすべて明記する>" < /dev/null
```

- **`run_in_background` は使わず、コマンドがフォアグラウンドで完了するまで待つこと**（timeoutは10分程度に余裕を持たせる）。バックグラウンド化すると、エージェントが「通知を待ちます」と言ってターンを終えてしまい、生成済みのPNGがwebp変換されないまま放置される事故が頻発した。
- 生成後は必ず `file` で実体確認 + Read ツールで目視し、捏造（ImageMagickの不自然な塗り）でないか、主体が実際に左寄せになっているかを確認する。
- webp変換: `magick {slug}.png -quality 90 assets/images/theme-symbols/{slug}.webp`
- 大量に作る時は6枚程度ずつ並列（Agentツールを1メッセージに複数まとめて起動）で回すとよい。1枚あたり数分〜10分程度かかる。

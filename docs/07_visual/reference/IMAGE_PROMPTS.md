# 画像生成プロンプト

ChatGPT Images / gpt-image 系で使うプロンプトの正本。

## 共通スタイル

```text
Use case: illustration-story
Asset type: visual reference for a philosophy visual novel project
Style/medium: modern delicate anime illustration, refined painterly rendering, soft but crisp linework, grounded fashion, subtle gold thread motifs, dark library / paper / light particles, no glossy idol look
Composition/framing: production character sheet or standalone environment concept art
Lighting/mood: quiet intellectual atmosphere, luminous dust, restrained contrast, not romantic, not seductive
Color palette: ink black, warm paper white, muted gold, deep blue shadows, character-specific accent color
Constraints: original fictional characters only; do not depict real philosophers; no copyrighted character names; no readable text except optional small decorative labels; avoid malformed typography
Avoid: camera-facing flirtatious smile, host-club look, BL fanservice, rose petals, sparkly idol eyes, exposed chest, old sage portrait, wax-museum historical costume, generic handsome same-face cast, watermark, logo
```

## キャラクターシート共通

重要: 既にキャラカードがある場合、プロンプトだけで作り直してはいけない。必ず該当キャラカードを reference image として渡し、「同じ人物をキャラクターシートへ展開する」と指定する。参照画像なしで作ると別人化する。

```text
Create a full production character sheet for {name}, an original fictional personification of {idea}.

The sheet should resemble a serious visual development board: one large full-body illustration on the left, four facial expression busts, front / side / back turnaround poses, costume and prop callouts, and small relationship silhouette thumbnails. Use mostly empty clean text blocks or decorative pseudo-layout boxes; do not rely on readable text.

Character direction:
- Age impression: late teens to early twenties, androgynous young adult.
- Role: {role}
- Ability concept: {ability}
- Personality: {personality}
- Visual motif: {motif}
- Expression: absorbed in thought, debating, observing, or doubting; never a camera-facing idol smile.
- Outfit: grounded modern-academic clothes with faint historical hints, layered fabric, book/paper/astronomical details, usable as a visual novel standing portrait.

Keep the character distinct from the existing cast through eye shape, posture, hair silhouette, hand gesture, and accent color. The result must be useful before LoRA compositing: clear face, clear outfit, clear turnaround, clear expression variants.
```

### 参照カードからシート化するときの追加文

```text
Input image role: reference image. It is the approved {name} card. Preserve the same character identity above all. Expand this exact character into a full production character sheet. Do not redesign the person.
```

## キャラ別メモ

> **視覚署名（隈／三白眼／鋭い眼光／刈り上げ／片目開眼）と theo のオッドアイ（翡翠／琥珀）は `../../02_characters/character_bible.md`「視覚署名」を正本とする。** 下表の personality/motif 列は署名追加前の素性メモなので、生成時は署名を併せて参照する。

| name | idea | ability | role | personality | motif |
|---|---|---|---|---|---|
| theo | reader's questioning self | none | blind protagonist / listener | neutral, quiet, sincere, still not passive | paper fragments, closed book, pale coat, heterochromia: jade-green & amber eyes |
| ヴィンチア | the first human impulse to know | 探究 | host / guide | playful, expansive, inviting, not ominous | sketchbook, compass, gears, warm sepia gold |
| アリスト | classification and observation | 観察 | observer | bright, precise, curious, able student energy | magnifying glass, leaves, owl, green accent |
| カンティア | theory of cognition and boundaries | 認識 | boundary thinker | serious, polite, rule-bound, quietly intense | geometric halo, measuring lines, white and blue |
| ヘグル | dialectic and synthesis | 弁証 | integrator | dramatic, sweeping, confident, pulls opposites together | black/red coat, opposing threads, crossing lines |
| デカリス | methodological doubt | 懐疑 | doubter | sharp, nervous, elegant, distrusts easy answers | prism, glass cube, fractured reflections, violet-blue |
| スピノ | pantheism and necessity | 汎神 | calm fatalist | serene, fearless, almost too free | sunlight, wind, bare skin only if non-seductive, turquoise-gold |
| ヒュー | empiricism and habit | 経験 | ironic observer | relaxed, amused, skeptical but warm | tea, glass, notebook, amber-purple |
| マキヤ | realism and power | 現実 | strategist | dry, practical, guarded, cuts through ideals | map, red thread, black coat, burnt umber |
| オウ | unity of knowing and doing | 知行 | practitioner | quiet, direct, disciplined, acts before preaching | brush ink, white robe, black hair, mineral green |

## ChatGPT Images2 用: 立ち絵4ビュー / 視覚署名リトライ

ChatGPT Images2（gpt-image-2）ブラウザで、各キャラの参考画像をアップロードしてから下のプロンプトを貼る。これは LoRA 資料用の同一人物4ビュー生成を正本化したもの。freeza 側の旧コピーは廃止し、このファイルを正本とする。

重要な実機知見:

- `keep identity ... identical` と全面禁止を強く書くと、旧参考画像の目・顔が固定され、theo のオッドアイや住人の視覚署名が乗らない。
- 視覚署名を足すときは、まず既存の良い front を reference にして、変更してよい一点だけを scoped edit する。
- 4ビュー展開は、署名が成功した front を reference にしてから行う。
- 4ビューは自由候補ではなく、必ず `front / 3/4 left / side / back` の character-sheet 形式に統一する。
- 4ビュー sheet は LoRA 学習前に等分スライスし、caption は `solo, single person`。`turnaround` / `character sheet` / `full body turnaround` は caption に書かない。

### theo フェーズ1: 目だけ scoped edit

既存 front（顔・服が気に入っている1枚）を添付し、目だけ変える。

```text
Edit this exact image. Keep the SAME character — identical face, hairstyle, clothes, accessories, pose, build and color palette. Change ONLY ONE thing: the eyes must become HETEROCHROMIA / odd eyes — the LEFT eye clearly JADE GREEN and the RIGHT eye clearly AMBER, two obviously different colors. Do NOT change anything else.
```

gpt-image-2 が heterochromia を渋る場合、目は極小領域なので片目の虹彩を画像エディタで recolor する方が確実。

### 4ビュー共通末尾ブロック

各キャラのプロンプト末尾に付ける。共通ブロックでは `heterochromia` と書かない。オッドアイはtheo 専用で、住人は各キャラ固有の目・視覚署名を保つ。

```text
Generate 4 images at once.
All images must depict the EXACT SAME CHARACTER.
Maintain identical identity, face structure, hairstyle, character-specific eye design / visual signature, costume, accessories, and color palette.
Do NOT redesign, reinterpret, or vary the character details.
Each image must be a full-body standing illustration with feet visible.
Each image must show a different angle:
1. front view
2. 3/4 view (left)
3. side view
4. back view
Only change pose and camera angle. Everything else must remain identical.
Present as a consistent character sheet-style set.
```

### theo（オッドアイ 翡翠/琥珀）

ref: `theo/.../costume_1/references/character/body/theo_char_body_front_01.png`・`_front_02.png`・`body_side_01.png`・`face/theo_char_face_front_01.png`

```text
Using the attached reference images as the same character, generate ONE new full-body standing illustration. Keep identity, hairstyle, costume and palette identical to the references.
theo, original character, ONE person only (solo, single person), adult, androgynous, ambiguous gender — can be seen as either a boy or a girl, very small chest (A-cup) NOT emphasized, slim build, short wavy silver-gray hair, HETEROCHROMIA / odd eyes (one jade green eye, one amber eye), quiet serious expression, not looking at the camera, pale layered long coat, white shirt, black trousers, black lace-up boots, holding a closed dark book, antique-gold chains, paper fragments, delicate modern anime painting, muted blue-gray and paper-white palette, full body with feet visible, plain pure white background, tall portrait composition, highest detail.
```

前開け版: `pale layered long coat, white shirt` -> `pale long coat worn OPEN over a thin white inner shirt, collarbone and upper chest lightly shown but modest and fully NON-SEXUAL, belly covered`

```text
Using the attached reference images as the same character, generate ONE new full-body standing illustration. Keep identity, hairstyle, costume and palette identical to the references.
theo, original character, ONE person only (solo, single person), adult, androgynous, ambiguous gender — can be seen as either a boy or a girl, very small chest (A-cup) NOT emphasized, slim build, short wavy silver-gray hair, HETEROCHROMIA / odd eyes (one jade green eye, one amber eye), quiet serious expression, not looking at the camera, pale long coat worn OPEN over a thin white inner shirt, collarbone and upper chest lightly shown but modest and fully NON-SEXUAL, belly covered, black trousers, black lace-up boots, holding a closed dark book, antique-gold chains, paper fragments, delicate modern anime painting, muted blue-gray and paper-white palette, full body with feet visible, plain pure white background, tall portrait composition, highest detail.
```

### デカリス（懐疑: 隈・猫背）

ref: `dekaris/.../costume_1/.../body/dekaris_char_body_front_01.png`・`_front_02.png`・`face/dekaris_char_face_front_01.png`、前開け `dekaris/.../costume_2/.../body/dekaris_char_body_front_open_01.png`

```text
Using the attached reference images as the same character, keep identity, hair, costume and palette identical.
dekarischar, original character, ONE person only (solo, single person), adult man, long dark navy hair, sharp violet-blue eyes, nervous elegant face, HEAVY DARK EYE-BAGS (deep shadows under the eyes), slightly hunched posture, languid yet piercing gaze, eerie-but-gentle genius air, not looking at camera, dark angular layered coat, prism glass cube and fractured reflection motifs, delicate painterly anime illustration, soft crisp linework, full body with feet visible, normal closed clothing, plain pure white background, tall portrait composition, highest detail.
```

前開け版: `normal closed clothing` -> `open-front clothing, jacket front open to upper sternum, abdomen covered, fully non-sexual`

### ヒュー（経験: 三白眼）

ref: `hue/.../costume_1/.../body/hue_char_body_front_01.png`・`_front_02.png`・`face/hue_char_face_front_01.png`、前開け `hue/.../costume_2/.../body/hue_char_body_front_open_01.png`

```text
Using the attached reference images as the same character, keep identity, hair, costume and palette identical.
huechar, original character, ONE person only (solo, single person), adult man, short curly blond hair, amber eyes, LOWER SANPAKU EYES (white of the eye visible below the iris), half-lidded deadpan look, goofy easygoing comic-relief air, relaxed amused face, not looking at camera, amber-purple academic tailcoat, tea glass and notebook motifs, delicate painterly anime illustration, soft crisp linework, full body with feet visible, normal closed clothing, plain pure white background, tall portrait composition, highest detail.
```

前開け版: `normal closed clothing` -> `open-front clothing, front open to upper sternum, abdomen covered, fully non-sexual`

### カンティア（認識: 鋭い眼光・黒眼帯）

ref: `kantia/.../costume_1/.../body/kantia_char_body_front_01.png`・`_front_02.png`・`face/kantia_char_face_front_01.png`、前開け `kantia/.../costume_2/.../body/kantia_char_body_front_open_01.png`

```text
Using the attached reference images as the same character, keep identity, hair, costume and palette identical.
kantiachar, original character, ONE person only (solo, single person), adult man, pale lavender-white tousled bob, black eyepatch over one eye, ONE VISIBLE cool blue eye with a SHARP PIERCING NARROW GAZE — looks stern and menacing but is kind at the core, disciplined composed expression, not looking at camera, slim build, white geometric long coat, celestial measuring ornaments, delicate painterly anime illustration, soft crisp linework, full body with feet visible, normal closed clothing, plain pure white background, tall portrait composition, highest detail.
```

前開け版: `normal closed clothing` -> `open-front clothing, front open to upper sternum, abdomen covered, fully non-sexual`

### マキヤ（現実: 後ろ刈り上げ / ツーブロック）

ref: `makiya/.../costume_1/.../body/makiya_char_body_front_01.png`・`_front_02.png`・`face/makiya_char_face_front_01.png`、前開け `makiya/.../costume_2/.../body/makiya_char_body_front_open_01.png`

```text
Using the attached reference images as the same character, keep identity, costume and palette identical, but CHANGE the hairstyle.
makiyachar, original character, ONE person only (solo, single person), adult man, UNDERCUT / TWO-BLOCK HAIRSTYLE — back and sides shaved short, length kept on top, modern sharp silhouette, black hair, guarded angular face, practical stern eyes, not looking at camera, black and burnt-umber long coat, red thread map and compass motifs, delicate painterly anime illustration, soft crisp linework, full body with feet visible, normal closed clothing, plain pure white background, tall portrait composition, highest detail.
```

前開け版: `normal closed clothing` -> `open-front clothing, front open to upper sternum, abdomen covered, fully non-sexual`

### オウ（知行: 片目開眼）

ref: `ou/.../costume_1/.../body/ou_char_body_front_01.png`・`_front_02.png`・`face/ou_char_face_front_01.png`、前開け `ou/.../costume_2/.../body/ou_char_body_front_open_01.png`

```text
Using the attached reference images as the same character, keep identity, hair, costume and palette identical.
ouchar, original character, ONE person only (solo, single person), adult man, ONE EYE QUIETLY OPEN and the other eye gently closed, calm one-eyed gaze, serene composed inward expression, disciplined practitioner air, long straight black hair tied with rigid ornaments, white-gray ink-wash robe, brush scroll and mineral-green motifs, delicate painterly anime illustration, soft crisp linework, full body with feet visible, normal closed clothing, plain pure white background, tall portrait composition, highest detail.
```

前開け版: `normal closed clothing` -> `open-front clothing, front open to upper sternum, abdomen covered, fully non-sexual`

### ヴィンチア（探究・司会）

ref: `vincia/.../costume_1/.../body/vincia_char_body_front_01.png`・`_front_02.png`・`body_side_02.png`・`body_back_02.png`・`face/vincia_char_face_front_01.png`、前開け `vincia/.../costume_2/.../body/vincia_char_body_front_open_01.png`

```text
Using the attached reference images as the same character, keep identity, hair, costume and palette identical.
vinciachar, original character, ONE person only (solo, single person), adult androgynous host / guide, playful expansive inviting expression, bright curious eyes, warm sepia-gold palette, sketchbook, compass, small gear motifs, flowing modern-academic coat, subtle golden thread and paper-fragment motifs, open questioning gesture, not ominous, not a villain, not looking at camera, delicate painterly anime illustration, soft crisp linework, full body with feet visible, normal closed clothing, plain pure white background, tall portrait composition, highest detail.
```

### アリスト（観察）

ref: `aristo/.../costume_1/.../body/aristo_char_body_front_01.png`・`_front_02.png`・`body_side_02.png`・`body_back_02.png`・`face/aristo_char_face_front_01.png`、前開け `aristo/.../costume_2/.../body/aristo_char_body_front_open_01.png`

```text
Using the attached reference images as the same character, keep identity, hair, costume and palette identical.
aristochar, original character, ONE person only (solo, single person), adult androgynous observer, bright precise curious face, clear focused eyes, gentle competent student-scholar air, green naturalist-academic palette, magnifying glass, leaves, owl and field-note motifs, neat layered modern-academic coat, classification / observation mood, calm upright posture, not looking at camera, delicate painterly anime illustration, soft crisp linework, full body with feet visible, normal closed clothing, plain pure white background, tall portrait composition, highest detail.
```

### ヘグル（弁証）

ref: `hegru/.../costume_1/.../body/hegru_char_body_front_01.png`・`_front_02.png`・`body_side_02.png`・`body_back_02.png`・`face/hegru_char_face_front_01.png`、前開け `hegru/.../costume_2/.../body/hegru_char_body_front_open_01.png`

```text
Using the attached reference images as the same character, keep identity, hair, costume and palette identical.
hegruchar, original character, ONE person only (solo, single person), adult man, DRAMATIC SWEEPING CONFIDENT presence, dialectic / synthesis mood, intense intelligent gaze, black and deep red layered coat, opposing threads and crossing-line motifs, upward spiral energy, integrator air, dynamic standing pose without action-scene exaggeration, stern confident expression, not looking at camera, delicate painterly anime illustration, soft crisp linework, full body with feet visible, normal closed clothing, plain pure white background, tall portrait composition, highest detail.
```

### スピノ（汎神）

ref: `spino/.../costume_1/.../body/spino_char_body_front_01.png`・`_front_02.png`・`body_side_02.png`・`body_back_02.png`・`face/spino_char_face_front_01.png`、前開け `spino/.../costume_2/.../body/spino_char_body_front_open_01.png`

```text
Using the attached reference images as the same character, keep identity, hair, costume and palette identical.
spinochar, original character, ONE person only (solo, single person), adult androgynous man, serene fearless almost too free expression, pantheism / necessity mood, calm fatalist presence, turquoise and muted-gold palette, sunlight and wind motifs, relaxed natural posture, dignified non-seductive openness, modest clothing clearly worn as clothing, no exposed abdomen, no swimsuit or underwear impression, no erotic posing, not looking at camera, delicate painterly anime illustration, soft crisp linework, full body with feet visible, normal closed clothing, plain pure white background, tall portrait composition, highest detail.
```

## ChatGPT Images2 用: UIインジケータ

theo-hayami の name-name クリック/送り UI 用プロンプト。文送りは動く筆、ページ送りは紙の角めくり。各アイコンは4フレーム横並び1枚で生成し、等分スライスして使う。黒墨を輝度から alpha 化し、name-name 側で薄灰/白に tint する。

### 文送り（動く筆・斜めサインカーブ・非方向・4フレーム・墨一色）

```text
One image: a HORIZONTAL STRIP of 4 evenly-spaced animation frames (left to right) of the SAME small UI indicator icon, identical brush / style / identity across all 4 frames, each in a square cell, on a pure white background.
Icon: a single slanted sumi calligraphy brush (ink-loaded bristle tip) shown IN MOTION, painting a wavy ink stroke whose path is a TILTED (diagonal) SINE CURVE. It evokes "writing continues / one more line" — NOT an arrow, no fixed direction implied.
It must read clearly as a small UI indicator (BOLD brush + clean stroke silhouette, does NOT dissolve into the background artwork) yet be painted DELICATELY so it harmonizes with fine art.
MONOCHROME only — grayscale sumi ink (black to soft gray), NO color at all, painted on a pure white background. Keep clean tonal ink gradations.
Animation across the 4 frames: the brush advances along the tilted sine-curve path while the wavy diagonal ink stroke grows behind it — frame1 brush near the start with a short stroke, frame2 ~1/3 along, frame3 ~2/3, frame4 near the end with the full wavy diagonal stroke. delicate sumi-e / watercolor, high-contrast, few elements, no text, no glossy 3D, no neon.
```

### ページ送り（紙の角めくり・4フレーム・墨一色）

```text
One image: a HORIZONTAL STRIP of 4 evenly-spaced animation frames (left to right) of the SAME small UI indicator icon, identical style / identity across all 4 frames, each in a square cell, on a pure white background.
Icon: a sheet of antique paper whose LOWER-RIGHT CORNER curls and turns — a "page-turn" indicator for an aesthetic ink-and-paper shadow-library visual novel.
It must read clearly as a small UI control (BOLD, clean silhouette, does NOT dissolve into the background artwork) yet be painted DELICATELY to harmonize with fine art.
MONOCHROME only — grayscale sumi ink (black to soft gray), NO color at all, painted on a pure white background. Keep clean tonal ink gradations.
Animation across the 4 frames: the corner CURLING — frame1 flat corner at rest, frame2 corner starting to lift, frame3 curled partway, frame4 turning over at its peak. delicate sumi-e / watercolor, high-contrast, few elements, no text, no glossy 3D, no neon.
```

## 背景: 影の図書館 大閲覧室

```text
Use case: illustration-story
Asset type: high-resolution environment background for a visual novel / embedded name-name scene
Primary request: a standalone high-resolution concept art background of the Grand Reading Room of the Shadow Library, based on the project setting.
Scene/backdrop: an immense circular library between dream, thought, and matter; countless books floating in the air; a domed glass ceiling with a faint astronomical grid; bridges, stairs, desks, reading lamps, and suspended paper fragments.
Style/medium: modern delicate anime background concept art with painterly detail, not photorealistic, not 3D render.
Composition/framing: wide 16:9 background with usable negative space for dialogue UI and standing portraits; strong central depth, readable floor area, no important detail at bottom center where UI may sit.
Lighting/mood: quiet midnight blue and warm lamp light, subtle gold connecting threads, intellectual and mysterious but not horror.
Color palette: deep navy, ink black, warm brass, pale paper, faint silver-blue light.
Constraints: no characters, no readable text, no logos, no watermark, no decorative UI frame.
Avoid: tiny low-resolution collage panel, cluttered unreadable details, fantasy castle, gothic horror, overbright magical explosion.
```

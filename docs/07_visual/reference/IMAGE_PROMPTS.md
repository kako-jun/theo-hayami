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

| name | idea | ability | role | personality | motif |
|---|---|---|---|---|---|
| せおはやみ | reader's questioning self | none | blind protagonist / listener | neutral, quiet, sincere, still not passive | paper fragments, closed book, pale coat, soft blue-gray |
| ヴィンチア | the first human impulse to know | 探究 | host / guide | playful, expansive, inviting, not ominous | sketchbook, compass, gears, warm sepia gold |
| アリスト | classification and observation | 観察 | observer | bright, precise, curious, able student energy | magnifying glass, leaves, owl, green accent |
| カンティア | theory of cognition and boundaries | 認識 | boundary thinker | serious, polite, rule-bound, quietly intense | geometric halo, measuring lines, white and blue |
| ヘグル | dialectic and synthesis | 弁証 | integrator | dramatic, sweeping, confident, pulls opposites together | black/red coat, opposing threads, crossing lines |
| デカリス | methodological doubt | 懐疑 | doubter | sharp, nervous, elegant, distrusts easy answers | prism, glass cube, fractured reflections, violet-blue |
| スピノ | pantheism and necessity | 汎神 | calm fatalist | serene, fearless, almost too free | sunlight, wind, bare skin only if non-seductive, turquoise-gold |
| ヒュー | empiricism and habit | 経験 | ironic observer | relaxed, amused, skeptical but warm | tea, glass, notebook, amber-purple |
| マキヤ | realism and power | 現実 | strategist | dry, practical, guarded, cuts through ideals | map, red thread, black coat, burnt umber |
| オウ | unity of knowing and doing | 知行 | practitioner | quiet, direct, disciplined, acts before preaching | brush ink, white robe, black hair, mineral green |

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

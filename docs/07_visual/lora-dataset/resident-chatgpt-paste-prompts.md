# ChatGPT Images2 Paste Prompts for Resident LoRA Sources

Use these prompts in browser ChatGPT Images2. This file is for `studio-yokonami#23`.

Rules:

- Use browser ChatGPT Images2, not Codex built-in ImageGEN, when generating 4 separate images at once.
- Upload only the listed reference images before each prompt.
- Phase 1 always starts from the single listed `*-priority*` master image only. Do not add old candidate images or secondary images at seed time.
- For redesigned characters, the practical identity source is often only that one priority image. Treat all other old images as optional visual notes, not identity references.
- Phase 2 may add Phase 1 normal accepted images as reference for open-front generation.
- Phase 2 open-front outputs are special costume-state outputs. Do not use them as references for Phase 3 normal poses or Phase 4 normal expressions.
- Each prompt asks for **4 separate images**, not a single sheet. If ChatGPT returns a sheet/contact sheet, reject it.
- Keep high-resolution separate image outputs.
- Final standing portrait scale is controlled later by `docs/02_characters/character_bible.md`.

Common rejection rules: reject if the output is a contact sheet, multiple characters in one image, low-resolution crop, elongated body/legs, host-club/idol/BL fanservice, exposed abdomen, erotic pose, or a redesigned identity.

Reference policy:

- Seed reference: exactly one master priority image.
- Selection: after each 4-image generation, keep only images whose face, hair, body build, costume, palette, and visual signature still match the master.
- Expansion reference: master + 1-3 accepted generated images only. Prefer front / side / back. If an accepted image feels even slightly off, do not use it as a reference for later phases.

---

## Vincia

Phase 1 でアップロードする参考画像: `docs/07_visual/reference/01_character-designs/vincia/20260630_vincia_chatgpt-generated-4view-priority_v01.png` だけ。旧 candidate や secondary は混ぜない。

Phase 1 normal 4 views:

```text
Using the attached master image as the exact identity reference, generate 4 separate high-resolution images of the SAME character: vinciachar.

Keep the same face, curly long brown hair, short beard and moustache, black beret, warm brown eyes, adult androgynous host / guide identity, 178cm assigned height impression, black layered modern-academic robe/coat, dark red inner fabric, warm sepia-gold compass and small gear motifs, subtle golden thread and paper-fragment motifs, book/sketchbook prop language, and open guide energy.

Create four separate full-body images:
1. front view, standing, one hand open in a questioning host gesture, the other holding an open sketchbook or book
2. 3/4 left view, standing, inviting the viewer into a question
3. side view, standing, book held close, robe silhouette readable
4. back view, showing coat shape, hair silhouette, and gold motif placement

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. Do not make a contact sheet. Do not show multiple poses in one image. Do not redesign the character. High-resolution separate images only.

Body constraints: natural anime standing portrait proportions, not elongated, not long-legged, not runway model proportions, do not stretch the body to fill the canvas.
```

Phase 2 でアップロードする参考画像: master priority 画像 + Phase 1 で生成して目視採用した画像 1〜3枚だけ。front/side/back を優先。旧 candidate や secondary は使わない。

Phase 2 open-front 4 views:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution images of the SAME character: vinciachar.

Keep the same face, hair, beard, beret, adult androgynous host / guide identity, 178cm assigned height impression, black layered robe/coat, dark red inner fabric, warm sepia-gold compass and gear motifs, golden threads, and book/sketchbook prop language.

Create an open-front clothing variant for LoRA training: the robe/coat and shirt front are open only to the upper sternum, collarbone and upper chest lightly visible, abdomen fully covered, fully non-sexual. Preserve the same outfit identity and motif language.

Create four separate full-body images:
1. front view
2. 3/4 left view
3. side view
4. back view

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. No seductive pose. No exposed abdomen. Do not redesign the character. High-resolution separate images only. Natural proportions, not elongated, not long-legged.
```

Phase 3 でアップロードする参考画像: master priority 画像 + Phase 1 normal で生成して目視採用した通常全身画像 1〜3枚だけ。front/side/back を優先。Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は使わない。

Phase 3 pose variants:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution full-body images of the SAME character: vinciachar.

Keep identity, face, hair, beard, beret, body build, costume, warm sepia-gold motif language, compass/gear ornaments, book/sketchbook prop, and palette identical. Only vary quiet host-like pose and emotional nuance.

Create four variants:
1. opening a question with one hand, amused but not flirting
2. holding the sketchbook close, clever and inviting
3. turning slightly as if guiding someone onward
4. relaxed standing pose, listening before asking the next question

Full body with feet visible. Plain pure white background. No text. No other people. No contact sheet. No idol smile. No seductive pose. No redesign. High-resolution separate images only. Natural proportions, not elongated.
```

Phase 4 でアップロードする参考画像: master priority 画像 + Phase 1 normal または Phase 3 normal pose で生成して目視採用した、顔が安定している画像または front 画像 1〜2枚だけ。通常表情を作る Phase なので、Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は、明示的に選び直した場合以外は使わない。

Phase 4 bust expressions:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution upper-body bust images of the SAME character: vinciachar.

Keep the same face structure, curly long brown hair, short beard and moustache, black beret, warm brown eyes, host / guide identity, black robe collar, dark red and warm sepia-gold accents, compass/gear ornaments, and painterly anime style.

Create four expression variants:
1. playful neutral host expression
2. teasing, about to ask a question
3. clever and inviting, eyes lively
4. gently serious, opening a deeper question

Upper-body bust portrait. Plain pure white background. No text. No other people. No glossy idol eyes. No flirtatious smile. Do not redesign the character. High-resolution separate images only.
```

---

## Aristo

Phase 1 でアップロードする参考画像: `docs/07_visual/reference/01_character-designs/aristo/20260630_aristo_chatgpt-generated-4view-priority_v01.png` だけ。旧 candidate や secondary は混ぜない。

Phase 1 normal 4 views:

```text
Using the attached master image as the exact identity reference, generate 4 separate high-resolution images of the SAME character: aristochar.

Keep the same face, hairstyle, adult androgynous observer identity, 170cm assigned height impression, bright precise curious face, clear focused eyes, green naturalist-academic palette, neat layered modern-academic coat, magnifying glass / field-note / leaves / owl motif language, and calm competent student-scholar air.

Create four separate full-body images:
1. front view, standing calmly with field notes or a small object
2. 3/4 left view, absorbed in observation, not posing for the camera
3. side view, observing a note or specimen tag shape
4. back view, showing coat shape and botanical/scientific details

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. Do not make a contact sheet. Do not redesign the character. High-resolution separate images only. Natural proportions, not elongated.
```

Phase 2 でアップロードする参考画像: master priority 画像 + Phase 1 で生成して目視採用した画像 1〜3枚だけ。front/side/back を優先。旧 candidate や secondary は使わない。

Phase 2 open-front 4 views:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution images of the SAME character: aristochar.

Keep the same face, hair, adult androgynous observer identity, 170cm assigned height impression, green naturalist-academic palette, neat coat, magnifying glass / field-note / leaves / owl motif language, and calm observational posture.

Create an open-front clothing variant for LoRA training: coat/cardigan front open only to the upper sternum, collarbone and upper chest lightly visible if natural, abdomen fully covered, fully non-sexual. Preserve the same outfit identity and motifs.

Create four separate full-body images:
1. front view
2. 3/4 left view
3. side view
4. back view

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. No seductive pose. No exposed abdomen. Do not redesign the character. High-resolution separate images only. Natural proportions, not elongated.
```

Phase 3 でアップロードする参考画像: master priority 画像 + Phase 1 normal で生成して目視採用した通常全身画像 1〜3枚だけ。front/side/back を優先。Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は使わない。

Phase 3 pose variants:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution full-body images of the SAME character: aristochar.

Keep identity, face, hair, body build, green palette, neat academic outfit, observation motifs, and calm precise personality identical. Only vary quiet observational pose and emotional nuance.

Create four variants:
1. looking slightly aside at a small object or note
2. writing a classification note, quietly excited by details
3. holding a magnifying glass low, composed and gentle
4. standing with notebooks gathered, friendly but focused

Full body with feet visible. Plain pure white background. No text. No other people. No contact sheet. No idol smile. No redesign. High-resolution separate images only. Natural proportions, not elongated.
```

Phase 4 でアップロードする参考画像: master priority 画像 + Phase 1 normal または Phase 3 normal pose で生成して目視採用した、顔が安定している画像または front 画像 1〜2枚だけ。通常表情を作る Phase なので、Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は、明示的に選び直した場合以外は使わない。

Phase 4 bust expressions:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution upper-body bust images of the SAME character: aristochar.

Keep the same face structure, hairstyle, clear focused eyes, adult androgynous observer impression, green academic accents, neat collar, and painterly anime style.

Create four expression variants:
1. neutral and attentive
2. quietly curious
3. gently explaining an observation
4. pleased by a precise detail, restrained smile

Upper-body bust portrait. Plain pure white background. No text. No other people. No glossy idol eyes. No flirtatious smile. Do not redesign the character. High-resolution separate images only.
```

---

## Kantia

Phase 1 でアップロードする参考画像: `docs/07_visual/reference/01_character-designs/kantia/20260630_kantia_chatgpt-generated-visual-signature-priority_v01.png` だけ。旧 candidate や secondary は混ぜない。

Phase 1 normal 4 views:

```text
Using the attached master image as the exact identity reference, generate 4 separate high-resolution images of the SAME character: kantiachar.

Keep the same face, pale lavender-white tousled bob, black eyepatch over one eye, one visible cool blue eye, adult man identity, slim build, 172cm assigned height impression, white geometric long coat, celestial measuring ornaments, boundary / cognition motif language, and disciplined composed expression.

Important visual signature: the one visible eye must have a SHARP PIERCING NARROW GAZE, stern and geometric, not generic soft eyes.

Create four separate full-body images:
1. front view, composed and precise
2. 3/4 left view, cool sharp gaze visible
3. side view, coat geometry readable
4. back view, showing coat shape and measuring-line motifs

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. Do not make a contact sheet. Do not redesign the character. High-resolution separate images only. Natural proportions, not elongated.
```

Phase 2 でアップロードする参考画像: master priority 画像 + Phase 1 で生成して目視採用した画像 1〜3枚だけ。front/side/back を優先。旧 candidate や secondary は使わない。

Phase 2 open-front 4 views:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution images of the SAME character: kantiachar.

Keep the same face, pale lavender-white hair, black eyepatch, one visible sharp cool blue eye, adult slim build, 172cm assigned height impression, white geometric coat, celestial measuring ornaments, and precise boundary motif language.

Create an open-front clothing variant for LoRA training: coat and shirt front open only to the upper sternum, collarbone and upper chest lightly visible if natural, abdomen fully covered, fully non-sexual. Preserve the same outfit identity and geometric motifs.

Create four separate full-body images:
1. front view
2. 3/4 left view
3. side view
4. back view

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. No seductive pose. No exposed abdomen. Do not redesign the character. High-resolution separate images only. Natural proportions, not elongated.
```

Phase 3 でアップロードする参考画像: master priority 画像 + Phase 1 normal で生成して目視採用した通常全身画像 1〜3枚だけ。front/side/back を優先。Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は使わない。

Phase 3 pose variants:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution full-body images of the SAME character: kantiachar.

Keep identity, face, eyepatch, visible sharp blue eye, pale lavender-white hair, slim build, white geometric coat, celestial measuring ornaments, and disciplined precise personality identical. Only vary small pose and intellectual nuance.

Create four variants:
1. one hand raised as if drawing a boundary line
2. looking down at an invisible measurement, stern and composed
3. holding a small geometric instrument, precise and quiet
4. standing still with a cool narrow gaze, rule-bound but not cruel

Full body with feet visible. Plain pure white background. No text. No other people. No contact sheet. No idol smile. No redesign. High-resolution separate images only. Natural proportions, not elongated.
```

Phase 4 でアップロードする参考画像: master priority 画像 + Phase 1 normal または Phase 3 normal pose で生成して目視採用した、顔が安定している画像または front 画像 1〜2枚だけ。通常表情を作る Phase なので、Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は、明示的に選び直した場合以外は使わない。

Phase 4 bust expressions:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution upper-body bust images of the SAME character: kantiachar.

Keep the same face structure, pale lavender-white tousled bob, black eyepatch, one visible cool blue eye, white geometric collar, celestial measuring details, and painterly anime style.

Important: the visible eye must remain sharp, piercing, narrow, and geometric.

Create four expression variants:
1. neutral and precise
2. stern narrow gaze
3. quietly explaining a boundary
4. softened but still disciplined

Upper-body bust portrait. Plain pure white background. No text. No other people. No glossy idol eyes. No flirtatious smile. Do not redesign the character. High-resolution separate images only.
```

---

## Hegru

Phase 1 でアップロードする参考画像: `docs/07_visual/reference/01_character-designs/hegru/20260630_hegru_chatgpt-generated-4view-priority_v01.png` だけ。旧 candidate や secondary は混ぜない。

Phase 1 normal 4 views:

```text
Using the attached master image as the exact identity reference, generate 4 separate high-resolution images of the SAME character: hegruchar.

Keep the same face, hairstyle, adult man identity, 182cm assigned height impression, dramatic sweeping confident presence, intense intelligent gaze, black and deep red layered coat, opposing threads and crossing-line motifs, upward spiral energy, and integrator / dialectic mood.

Create four separate full-body images:
1. front view, standing with confident upward argument energy
2. 3/4 left view, coat moving slightly as if caught in thought
3. side view, structured silhouette readable
4. back view, showing crossing-line motifs and coat shape

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. Do not make a contact sheet. Do not redesign the character. High-resolution separate images only. Natural proportions, not elongated beyond his assigned tall presence.
```

Phase 2 でアップロードする参考画像: master priority 画像 + Phase 1 で生成して目視採用した画像 1〜3枚だけ。front/side/back を優先。旧 candidate や secondary は使わない。

Phase 2 open-front 4 views:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution images of the SAME character: hegruchar.

Keep the same face, hair, adult man identity, 182cm assigned height impression, black and deep red layered coat, crossing-line motifs, upward spiral energy, intense intelligent gaze, and dialectic / synthesis mood.

Create an open-front clothing variant for LoRA training: coat and shirt front open only to the upper sternum, collarbone and upper chest lightly visible if natural, abdomen fully covered, fully non-sexual. Preserve the same outfit identity and black/red motifs.

Create four separate full-body images:
1. front view
2. 3/4 left view
3. side view
4. back view

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. No seductive pose. No exposed abdomen. Do not redesign the character. High-resolution separate images only. Natural proportions, tall but not stretched.
```

Phase 3 でアップロードする参考画像: master priority 画像 + Phase 1 normal で生成して目視採用した通常全身画像 1〜3枚だけ。front/side/back を優先。Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は使わない。

Phase 3 pose variants:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution full-body images of the SAME character: hegruchar.

Keep identity, face, hair, body build, black/red coat, crossing-line motifs, and dramatic confident personality identical. Only vary intellectual pose and emotional nuance.

Create four variants:
1. sweeping one hand upward as if synthesizing an argument
2. pulling two opposing ideas together with both hands
3. coat moving slightly, eyes focused past the viewer
4. standing grandly, confident but not villainous

Full body with feet visible. Plain pure white background. No text. No other people. No contact sheet. No vampire, no military dictator costume, no BL rose aesthetic. No redesign. High-resolution separate images only. Natural proportions.
```

Phase 4 でアップロードする参考画像: master priority 画像 + Phase 1 normal または Phase 3 normal pose で生成して目視採用した、顔が安定している画像または front 画像 1〜2枚だけ。通常表情を作る Phase なので、Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は、明示的に選び直した場合以外は使わない。

Phase 4 bust expressions:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution upper-body bust images of the SAME character: hegruchar.

Keep the same face structure, hairstyle, intense intelligent gaze, black/deep red collar, crossing-line motifs, and painterly anime style.

Create four expression variants:
1. confident neutral
2. dramatic explaining expression
3. focused past the viewer, thinking upward
4. satisfied synthesis, restrained smile

Upper-body bust portrait. Plain pure white background. No text. No other people. No glossy idol eyes. No villain smirk. Do not redesign the character. High-resolution separate images only.
```

---

## Dekaris

Phase 1 でアップロードする参考画像: `docs/07_visual/reference/01_character-designs/dekaris/20260630_dekaris_chatgpt-generated-visual-signature-priority_v01.png` だけ。旧 candidate や secondary は混ぜない。

Phase 1 normal 4 views:

```text
Using the attached master image as the exact identity reference, generate 4 separate high-resolution images of the SAME character: dekarischar.

Keep the same face, long dark navy hair, adult man identity, 176cm assigned height impression, nervous elegant face, sharp violet-blue eyes, HEAVY DARK EYE-BAGS, slightly hunched posture, dark angular layered coat, prism glass cube / fractured reflection motifs, and eerie-but-gentle genius air.

Create four separate full-body images:
1. front view, slightly hunched, dark eye-bags visible
2. 3/4 left view, nervous elegant posture
3. side view, hunch and coat silhouette readable
4. back view, showing coat shape and fractured motif placement

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. Do not make a contact sheet. Do not redesign the character. High-resolution separate images only. Natural proportions, not elongated.
```

Phase 2 でアップロードする参考画像: master priority 画像 + Phase 1 で生成して目視採用した画像 1〜3枚だけ。front/side/back を優先。旧 candidate や secondary は使わない。

Phase 2 open-front 4 views:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution images of the SAME character: dekarischar.

Keep the same face, long dark navy hair, sharp violet-blue eyes, heavy dark eye-bags, adult man identity, 176cm assigned height impression, dark angular coat, prism / fractured reflection motifs, and slightly hunched nervous genius posture.

Create an open-front clothing variant for LoRA training: jacket and shirt front open only to the upper sternum, collarbone and upper chest lightly visible if natural, abdomen fully covered, fully non-sexual. Preserve the same outfit identity and fractured glass motifs.

Create four separate full-body images:
1. front view
2. 3/4 left view
3. side view
4. back view

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. No seductive pose. No exposed abdomen. Do not redesign the character. High-resolution separate images only. Natural proportions, not elongated.
```

Phase 3 でアップロードする参考画像: master priority 画像 + Phase 1 normal で生成して目視採用した通常全身画像 1〜3枚だけ。front/side/back を優先。Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は使わない。

Phase 3 pose variants:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution full-body images of the SAME character: dekarischar.

Keep identity, face, long dark navy hair, heavy eye-bags, slight hunch, dark angular coat, prism/fractured motifs, and nervous elegant genius personality identical. Only vary quiet pose and emotional nuance.

Create four variants:
1. holding a prism cube low, suspicious and tired
2. one hand near the temple, doubting quietly
3. slightly recoiling, distrustful but gentle
4. standing with shoulders low, sharp tired gaze

Full body with feet visible. Plain pure white background. No text. No other people. No contact sheet. No idol smile. No host-club look. No redesign. High-resolution separate images only. Natural proportions.
```

Phase 4 でアップロードする参考画像: master priority 画像 + Phase 1 normal または Phase 3 normal pose で生成して目視採用した、顔が安定している画像または front 画像 1〜2枚だけ。通常表情を作る Phase なので、Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は、明示的に選び直した場合以外は使わない。

Phase 4 bust expressions:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution upper-body bust images of the SAME character: dekarischar.

Keep the same face structure, long dark navy hair, sharp violet-blue eyes, HEAVY DARK EYE-BAGS, dark angular collar, prism/fractured detail, and painterly anime style.

Create four expression variants:
1. tired neutral
2. suspicious narrow gaze
3. nervous slight smile, not handsome idol
4. quietly relieved but still exhausted

Upper-body bust portrait. Plain pure white background. No text. No other people. No glossy idol eyes. No flirtatious smile. Do not redesign the character. High-resolution separate images only.
```

---

## Spino

Phase 1 でアップロードする参考画像: `docs/07_visual/reference/01_character-designs/spino/20260630_spino_chatgpt-generated-4view-priority_v01.png` だけ。旧 candidate や secondary は混ぜない。

Phase 1 normal 4 views:

```text
Using the attached master image as the exact identity reference, generate 4 separate high-resolution images of the SAME character: spinochar.

Keep the same face, hairstyle, adult androgynous man identity, 184cm assigned height impression, serene fearless expression, calm fatalist presence, turquoise and muted-gold palette, sunlight and wind motifs, modest clothing clearly worn as clothing, and pantheism / necessity mood.

Create four separate full-body images:
1. front view, relaxed upright posture, calm distant eyes
2. 3/4 left view, open but non-seductive body language
3. side view, wind and cloth silhouette readable
4. back view, showing light outer cloth and natural motif placement

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. Do not make a contact sheet. Do not redesign the character. High-resolution separate images only. Natural tall proportions, not stretched.
```

Phase 2 でアップロードする参考画像: master priority 画像 + Phase 1 で生成して目視採用した画像 1〜3枚だけ。front/side/back を優先。旧 candidate や secondary は使わない。

Phase 2 open-front 4 views:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution images of the SAME character: spinochar.

Keep the same face, hair, adult androgynous man identity, 184cm assigned height impression, turquoise and muted-gold palette, sunlight and wind motifs, serene fearlessness, and modest clothing clearly worn as clothing.

Create an open-front clothing variant for LoRA training: outer cloth and shirt front open only to the upper sternum, collarbone and upper chest lightly visible if natural, abdomen fully covered, fully non-sexual. Preserve the same outfit identity and calm wind/sun motif language.

Create four separate full-body images:
1. front view
2. 3/4 left view
3. side view
4. back view

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. No erotic bare chest. No exposed abdomen. No beach/fantasy god look. Do not redesign the character. High-resolution separate images only. Natural tall proportions, not stretched.
```

Phase 3 でアップロードする参考画像: master priority 画像 + Phase 1 normal で生成して目視採用した通常全身画像 1〜3枚だけ。front/side/back を優先。Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は使わない。

Phase 3 pose variants:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution full-body images of the SAME character: spinochar.

Keep identity, face, hair, body build, turquoise-gold palette, sunlight/wind motifs, modest clothing, and serene fearless personality identical. Only vary quiet pose and emotional nuance.

Create four variants:
1. relaxed upright posture, hands open calmly
2. looking into the distance, fearless and warm
3. cloth moved lightly by wind, body language open but not seductive
4. standing as if boundaries between self and world have softened

Full body with feet visible. Plain pure white background. No text. No other people. No contact sheet. No erotic pose. No saint icon. No beach/fantasy god. No redesign. High-resolution separate images only. Natural tall proportions.
```

Phase 4 でアップロードする参考画像: master priority 画像 + Phase 1 normal または Phase 3 normal pose で生成して目視採用した、顔が安定している画像または front 画像 1〜2枚だけ。通常表情を作る Phase なので、Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は、明示的に選び直した場合以外は使わない。

Phase 4 bust expressions:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution upper-body bust images of the SAME character: spinochar.

Keep the same face structure, hairstyle, calm distant eyes, turquoise-gold accents, wind/sun motif language, modest collar/cloth, and painterly anime style.

Create four expression variants:
1. serene neutral
2. fearless about death, calm and warm
3. distant eyes, almost too free
4. gentle smile, non-seductive and quiet

Upper-body bust portrait. Plain pure white background. No text. No other people. No glossy idol eyes. No erotic framing. Do not redesign the character. High-resolution separate images only.
```

---

## Hue

Phase 1 でアップロードする参考画像: `docs/07_visual/reference/01_character-designs/hue/20260630_hue_chatgpt-generated-visual-signature-priority_v02.png` だけ。旧 candidate や secondary は混ぜない。

Phase 1 normal 4 views:

```text
Using the attached master image as the exact identity reference, generate 4 separate high-resolution images of the SAME character: huechar.

Keep the same face, short curly blond hair, adult man identity, 168cm assigned height impression, amber eyes, LOWER SANPAKU EYES, half-lidded deadpan look, relaxed amused face, amber-purple academic tailcoat, tea glass / notebook motifs, and goofy easygoing comic-relief air.

Create four separate full-body images:
1. front view, relaxed and amused, lower sanpaku eyes visible
2. 3/4 left view, easygoing slouch but not sloppy
3. side view, tailcoat silhouette readable
4. back view, showing coat shape and motif placement

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. Do not make a contact sheet. Do not redesign the character. High-resolution separate images only. Natural slightly smaller proportions, not elongated.
```

Phase 2 でアップロードする参考画像: master priority 画像 + Phase 1 で生成して目視採用した画像 1〜3枚だけ。front/side/back を優先。旧 candidate や secondary は使わない。

Phase 2 open-front 4 views:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution images of the SAME character: huechar.

Keep the same face, short curly blond hair, amber lower-sanpaku eyes, half-lidded deadpan look, adult man identity, 168cm assigned height impression, amber-purple academic tailcoat, tea/notebook motif language, and relaxed ironic warmth.

Create an open-front clothing variant for LoRA training: tailcoat and shirt front open only to the upper sternum, collarbone and upper chest lightly visible if natural, abdomen fully covered, fully non-sexual. Preserve the same outfit identity and motif language.

Create four separate full-body images:
1. front view
2. 3/4 left view
3. side view
4. back view

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. No seductive pose. No exposed abdomen. Do not redesign the character. High-resolution separate images only. Natural slightly smaller proportions, not elongated.
```

Phase 3 でアップロードする参考画像: master priority 画像 + Phase 1 normal で生成して目視採用した通常全身画像 1〜3枚だけ。front/side/back を優先。Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は使わない。

Phase 3 pose variants:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution full-body images of the SAME character: huechar.

Keep identity, face, short curly blond hair, lower sanpaku eyes, amber-purple outfit, tea/notebook motifs, and relaxed ironic personality identical. Only vary quiet pose and emotional nuance.

Create four variants:
1. holding a tea glass, amused and sleepy-eyed
2. shrugging lightly, easygoing and skeptical
3. leaning slightly as if telling a joke, not flirting
4. notebook in one hand, half-lidded deadpan look

Full body with feet visible. Plain pure white background. No text. No other people. No contact sheet. No idol smile. No sharp villain eyes. No redesign. High-resolution separate images only. Natural proportions.
```

Phase 4 でアップロードする参考画像: master priority 画像 + Phase 1 normal または Phase 3 normal pose で生成して目視採用した、顔が安定している画像または front 画像 1〜2枚だけ。通常表情を作る Phase なので、Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は、明示的に選び直した場合以外は使わない。

Phase 4 bust expressions:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution upper-body bust images of the SAME character: huechar.

Keep the same face structure, short curly blond hair, amber LOWER SANPAKU EYES, half-lidded sleepy look, amber-purple collar, and painterly anime style.

Create four expression variants:
1. relaxed neutral
2. amused deadpan
3. skeptical but warm
4. sleepy half-smile, not seductive

Upper-body bust portrait. Plain pure white background. No text. No other people. No glossy idol eyes. No flirtatious smile. Do not redesign the character. High-resolution separate images only.
```

---

## Makiya

Phase 1 でアップロードする参考画像: `docs/07_visual/reference/01_character-designs/makiya/20260630_makiya_chatgpt-generated-master-priority_v01.png` だけ。旧 candidate や secondary は混ぜない。

注意: `docs/07_visual/reference/01_character-designs/makiya/20260630_makiya_chatgpt-generated-visual-signature-priority_v01.png` は右端に別カット断片が入っているため、参考画像に使わない。

Phase 1 normal 4 views:

```text
Using the attached master image as the exact identity reference, generate 4 separate high-resolution images of the SAME character: makiyachar.

Keep the same face, black hair with UNDERCUT / TWO-BLOCK HAIRSTYLE, back and sides shaved short, adult man identity, 180cm assigned height impression, guarded angular face, practical stern eyes, black and burnt-umber long coat, red thread map and compass motifs, and dry realist strategist air.

Create four separate full-body images:
1. front view, practical stern posture
2. 3/4 left view, guarded and analytical
3. side view, undercut silhouette and coat shape readable
4. back view, shaved back/sides implied, coat and red-thread motif readable

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. Do not make a contact sheet. Do not redesign the character. High-resolution separate images only. Natural strong proportions, not elongated.
```

Phase 2 でアップロードする参考画像: master priority 画像 + Phase 1 で生成して目視採用した画像 1〜3枚だけ。front/side/back を優先。旧 candidate や secondary は使わない。

Phase 2 open-front 4 views:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution images of the SAME character: makiyachar.

Keep the same face, black undercut / two-block hairstyle, adult man identity, 180cm assigned height impression, guarded angular face, black and burnt-umber coat, red thread map and compass motifs, and dry practical strategist air.

Create an open-front clothing variant for LoRA training: coat and shirt front open only to the upper sternum, collarbone and upper chest lightly visible if natural, abdomen fully covered, fully non-sexual. Preserve the same outfit identity and red-thread map motifs.

Create four separate full-body images:
1. front view
2. 3/4 left view
3. side view
4. back view

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. No seductive pose. No exposed abdomen. Do not redesign the character. High-resolution separate images only. Natural strong proportions, not elongated.
```

Phase 3 でアップロードする参考画像: master priority 画像 + Phase 1 normal で生成して目視採用した通常全身画像 1〜3枚だけ。front/side/back を優先。Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は使わない。

Phase 3 pose variants:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution full-body images of the SAME character: makiyachar.

Keep identity, face, black undercut hairstyle, body build, black/burnt-umber coat, red thread map and compass motifs, and dry realist personality identical. Only vary practical pose and emotional nuance.

Create four variants:
1. holding a folded map, guarded and calculating
2. one hand near a compass, practical stern gaze
3. turning slightly away, weighing costs
4. standing firmly, no idealism, no theatrics

Full body with feet visible. Plain pure white background. No text. No other people. No contact sheet. No host-club handsome look. No redesign. High-resolution separate images only. Natural proportions.
```

Phase 4 でアップロードする参考画像: master priority 画像 + Phase 1 normal または Phase 3 normal pose で生成して目視採用した、顔が安定している画像または front 画像 1〜2枚だけ。通常表情を作る Phase なので、Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は、明示的に選び直した場合以外は使わない。

Phase 4 bust expressions:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution upper-body bust images of the SAME character: makiyachar.

Keep the same face structure, black undercut / two-block hairstyle, guarded practical eyes, black/burnt-umber collar, red thread and compass details, and painterly anime style.

Create four expression variants:
1. guarded neutral
2. dry skeptical look
3. practical warning expression
4. faint restrained approval, not warm idol smile

Upper-body bust portrait. Plain pure white background. No text. No other people. No glossy idol eyes. No flirtatious smile. Do not redesign the character. High-resolution separate images only.
```

---

## Ou

Phase 1 でアップロードする参考画像: `docs/07_visual/reference/01_character-designs/ou/20260630_ou_chatgpt-generated-visual-signature-priority_v01.png` だけ。旧 candidate や secondary は混ぜない。

Phase 1 normal 4 views:

```text
Using the attached master image as the exact identity reference, generate 4 separate high-resolution images of the SAME character: ouchar.

Keep the same face, long straight black hair tied with rigid ornaments, adult man identity, 173cm assigned height impression, ONE EYE QUIETLY OPEN and the other eye gently closed, calm one-eyed gaze, serene composed inward expression, white-gray ink-wash robe, brush scroll and mineral-green motifs, and disciplined practitioner air.

Create four separate full-body images:
1. front view, one eye quietly open, the other gently closed
2. 3/4 left view, calm disciplined posture
3. side view, robe and hair ornaments readable
4. back view, showing robe shape, hair tie, and mineral-green motif placement

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. Do not make a contact sheet. Do not redesign the character. High-resolution separate images only. Natural proportions, not elongated.
```

Phase 2 でアップロードする参考画像: master priority 画像 + Phase 1 で生成して目視採用した画像 1〜3枚だけ。front/side/back を優先。旧 candidate や secondary は使わない。

Phase 2 open-front 4 views:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution images of the SAME character: ouchar.

Keep the same face, long straight black hair and ornaments, adult man identity, 173cm assigned height impression, one eye quietly open and the other gently closed, white-gray ink-wash robe, brush scroll and mineral-green motifs, and disciplined practitioner air.

Create an open-front clothing variant for LoRA training: robe/front layer open only to the upper sternum, collarbone and upper chest lightly visible if natural, abdomen fully covered, fully non-sexual. Preserve the same robe identity and brush/mineral-green motifs.

Create four separate full-body images:
1. front view
2. 3/4 left view
3. side view
4. back view

Full body with feet visible. Plain pure white background. No text. No UI panels. No other people. No seductive pose. No exposed abdomen. Do not redesign the character. High-resolution separate images only. Natural proportions, not elongated.
```

Phase 3 でアップロードする参考画像: master priority 画像 + Phase 1 normal で生成して目視採用した通常全身画像 1〜3枚だけ。front/side/back を優先。Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は使わない。

Phase 3 pose variants:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution full-body images of the SAME character: ouchar.

Keep identity, face, one-eye-open signature, long black hair, robe, brush scroll, mineral-green motifs, and calm disciplined personality identical. Only vary quiet practical pose and emotional nuance.

Create four variants:
1. holding a brush scroll calmly, action before preaching
2. one hand lowered as if about to act, composed and direct
3. standing with inward stillness, one eye quietly open
4. slight turn, disciplined and unshowy

Full body with feet visible. Plain pure white background. No text. No other people. No contact sheet. No hot-blooded martial artist pose. No redesign. High-resolution separate images only. Natural proportions.
```

Phase 4 でアップロードする参考画像: master priority 画像 + Phase 1 normal または Phase 3 normal pose で生成して目視採用した、顔が安定している画像または front 画像 1〜2枚だけ。通常表情を作る Phase なので、Phase 2 open-front の成果物は混ぜない。旧 candidate や secondary は、明示的に選び直した場合以外は使わない。

Phase 4 bust expressions:

```text
Using the attached reference images as the exact same character identity, generate 4 separate high-resolution upper-body bust images of the SAME character: ouchar.

Keep the same face structure, long straight black hair with rigid ornaments, ONE EYE QUIETLY OPEN and the other gently closed, calm one-eyed gaze, white-gray robe collar, brush/mineral-green details, and painterly anime style.

Create four expression variants:
1. serene neutral
2. inward disciplined focus
3. direct practical answer, quiet gaze
4. softened calm, still one-eye-open signature

Upper-body bust portrait. Plain pure white background. No text. No other people. No glossy idol eyes. No flirtatious smile. Do not redesign the character. High-resolution separate images only.
```

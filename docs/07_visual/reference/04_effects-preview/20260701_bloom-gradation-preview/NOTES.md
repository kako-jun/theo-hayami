# 2026-07-01 ブルーム/ハレーション/階調化プレビュー

素材: `assets/images/theo/normal.png`（等倍・365x698）+ `assets/images/shadow-library/grand-reading-room.webp` を合成。ImageMagick で効果を試作（PixiJS 実装前の方向性検討用モックアップ）。

| ファイル | 手法 | メモ |
|---|---|---|
| `1_base_no-effect` | なし | 比較基準。背景の書架は輪郭が締まっているが、theo の輪郭線はそれより柔らかい＝解像度不足の症状が見える |
| `2_bloom_strong` | 明部抽出(level 55%)+blur 14+暖色tint 20%+screen | 全体が霞み背景まで夕方色になった（NG・kako-jun 指摘） |
| `3_halation_warm-light` | 明部抽出(level 65%)+blur 8+暖色tint 25%+screen | 同上、暖色被りが強い（NG） |
| `4_bloom_plus_sharpen` | 2 に unsharp 追加 | 輪郭は戻るが粗さが強調されるリスク |
| `5_overlay_strong` | 自身をblur 20してoverlay合成（100%） | コントラスト増、しわ等の陰影が深まり「べた塗り→階調」の狙いに合う。やや暗くドラマチック |
| `6_softlight_strong` | 自身をblur 20してsoft-light合成（100%） | 明部（ドーム光）が飛び気味。階調付与というより白飛び |
| `7_overlay_moderate` | 5 を base に45%disolve | 5 の穏やかな版 |
| `8_softlight_moderate` | 6 を base に55%dissolve | 6 の穏やかな版 |
| `9_bloom_whitepoint_only` | 明部抽出(level 90%)+blur 9+tint無し+screen | 白色点（ドーム光・シャツ・髪ハイライト）だけが自然に発光。色被りなし。骨格は base とほぼ同じで効果は控えめ |
| `compare_all_4up` | 1/2/3/4 横並び | 初回比較（暖色tint系がNGだった回） |
| `compare_overlay_5up` | 1/5/6/7/8 横並び | overlay/soft-light系の比較 |

## kako-jun の狙い（2026-07-01 会話より）
- 明るい点だけを光らせるのではなく、**背景も人物も、べた塗りの平坦な領域がグラデーションかのように見えて「高見え」する**のが目的。
- overlay 合成（5・7）が soft-light（6・8）より狙いに近い（陰影が深まる＝階調が付く。soft-light は単に白く霞むだけ）。
- 「常に1つはかける」前提で擬似高解像度化の効果を期待。暗すぎ/明るすぎる版（2・3・6等）も演出用途として捨てずに保持する。

## 次に検討すること（未決定）
- 上記のどれを name-name #316 の実装パラメータの起点にするか。
- overlay 系のコントラスト増加が「常時オン」でも他シーン（明るい背景等）で破綻しないか。
- 強度をゲーム内でシーンごとに調整可能にするか、固定値にするか。

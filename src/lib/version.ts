// Issue #62: フッタの版表示 `vYYYY-MM-DD` を組み立てる純粋関数。
// SiteFooter.astro の frontmatter に直書きすると .astro のテストができない（vitest は
// environment: "node" で jsdom/happy-dom 未導入・.astro の frontmatter は直接実行できない）ため、
// ロジックだけをここへ抽出する。
//
// `??` ではなく `||` を使う: package.json の "build" スクリプトは
// `PUBLIC_BUILD_DATE=$(TZ=Asia/Tokyo date +%Y-%m-%d)` で注入するため通常は空文字にならないが、
// シェル置換が失敗して空文字 "" になった場合も `??` は素通りしてしまい `"v"` だけになる
// （nullish coalescing は "" を nullish と見なさない）。`||` なら "" も falsy としてフォールバックする。
export function formatVersion(buildDate: string | undefined): string {
  return `v${buildDate || "dev"}`;
}

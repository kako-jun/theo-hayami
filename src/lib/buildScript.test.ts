import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// package.json の "build" スクリプトが PUBLIC_BUILD_DATE をシェルで注入する作法の回帰ガード。
// astro.config.mjs の vite.define 方式は output:"static" のプリレンダーが本ファイルを
// 複数回再評価し後勝ちで上書きするため実機で `vundefined` 化した事故がある（astro.config.mjs
// コメント参照）。誰かが "build" を書き換えて注入を落としても気付けるようにする。

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf-8")) as {
  scripts: Record<string, string>;
};

describe("package.json build スクリプトの PUBLIC_BUILD_DATE 注入", () => {
  it("TZ=Asia/Tokyo を含む（JST基準で日付を確定する）", () => {
    expect(pkg.scripts.build).toContain("TZ=Asia/Tokyo");
  });

  it("PUBLIC_BUILD_DATE= を含む（vite.define ではなくシェル注入で固定する）", () => {
    expect(pkg.scripts.build).toContain("PUBLIC_BUILD_DATE=");
  });
});

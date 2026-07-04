import { defineConfig } from "vitest/config";

// 索引データレイヤー（src/lib/scripts.ts）は node の fs で content/scripts/ を読むだけの
// 純ロジック。DOM は不要なので node 環境で走らせる（hanoba の happy-dom 構成は React 島用）。
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

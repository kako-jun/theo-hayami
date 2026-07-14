import { describe, expect, it } from "vitest";
import { PWA_UPDATE_COOLDOWN_MS, shouldSkipUpdate } from "./pwa-update.ts";

// shouldSkipUpdate は PWA 更新 overlay の reload loop 防止 cooldown 判定（純粋関数）。
// sessionStorage I/O やタイマーは含まないため node 環境でそのままテストできる。
// ここでは種となるケースだけを置く（本格的なテスト作成は別途行う）。

describe("shouldSkipUpdate", () => {
  it("lastUpdateAt が null（未記録・初回）なら false（スキップしない）", () => {
    expect(shouldSkipUpdate(null, Date.now(), PWA_UPDATE_COOLDOWN_MS)).toBe(false);
  });

  it("cooldown 未満の経過時間なら true（スキップする）", () => {
    const now = 1_000_000;
    expect(shouldSkipUpdate(now - 1, now, PWA_UPDATE_COOLDOWN_MS)).toBe(true);
  });

  it("cooldown ちょうど・cooldown 超過なら false（スキップしない）", () => {
    const now = 1_000_000;
    expect(shouldSkipUpdate(now - PWA_UPDATE_COOLDOWN_MS, now, PWA_UPDATE_COOLDOWN_MS)).toBe(false);
    expect(shouldSkipUpdate(now - PWA_UPDATE_COOLDOWN_MS - 1, now, PWA_UPDATE_COOLDOWN_MS)).toBe(false);
  });
});

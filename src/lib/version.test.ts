import { describe, expect, it } from "vitest";
import { formatVersion } from "./version.ts";

// formatVersion は SiteFooter.astro の版表示ロジックを抽出した純粋関数。
// astro dev では PUBLIC_BUILD_DATE が未設定（undefined）、build 時のシェル置換が万一
// 失敗すれば空文字（""）になり得るので、両方が "dev" にフォールバックすることを守る。

describe("formatVersion", () => {
  it("undefined は v dev にフォールバックする（astro dev の未設定ケース）", () => {
    expect(formatVersion(undefined)).toBe("vdev");
  });

  it("空文字は v dev にフォールバックする（?? だと素通りして 'v' だけになるバグの回帰テスト）", () => {
    expect(formatVersion("")).toBe("vdev");
  });

  it("日付文字列はそのまま v を前置して返す（正常系）", () => {
    expect(formatVersion("2026-07-13")).toBe("v2026-07-13");
  });
});

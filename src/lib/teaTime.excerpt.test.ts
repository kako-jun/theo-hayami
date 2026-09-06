// ティータイム一覧の相談文の長さ（Issue #182）。長い相談文はそのまま一覧に出さず、
// 一覧用の一文要約 excerpt を持つことを固定する。詳細ページの引用は全文のまま。
import { describe, expect, it } from "vitest";
import { publishedTeaTimeQuestions, teaTimeQuestions } from "../data/teaTime";

const LONG_QUESTION = 90;
const MAX_EXCERPT = 70;
const all = [...publishedTeaTimeQuestions, ...teaTimeQuestions];

describe("ティータイム一覧の要約（excerpt）", () => {
  it("90字を超える相談文には一覧用の excerpt がある", () => {
    const missing = all.filter((q) => q.question.length > LONG_QUESTION && !q.excerpt).map((q) => q.slug);
    expect(missing).toEqual([]);
  });

  it("excerpt は70字以内・空でない・question と同一でない", () => {
    for (const q of all) {
      if (q.excerpt === undefined) continue;
      expect(q.excerpt.length, q.slug).toBeGreaterThan(0);
      expect(q.excerpt.length, q.slug).toBeLessThanOrEqual(MAX_EXCERPT);
      expect(q.excerpt, q.slug).not.toBe(q.question);
    }
  });

  it("短い相談文は excerpt を持たない（二重管理を増やさない）", () => {
    const needless = all.filter((q) => q.question.length <= LONG_QUESTION && q.excerpt).map((q) => q.slug);
    expect(needless).toEqual([]);
  });
});

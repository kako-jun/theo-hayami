// ティータイムの相談文の長さ（Issue #182 / #184）。サイトに出す question は一文の要約で、
// 相談者の原文そのままは載せない（原文は Issue に記録、要点は脚本の司会役が紹介で語る）。
import { describe, expect, it } from "vitest";
import { publishedTeaTimeQuestions, teaTimeQuestions } from "../data/teaTime";

const MAX_QUESTION = 90;
const all = [...publishedTeaTimeQuestions, ...teaTimeQuestions];

describe("ティータイムの相談文（question）", () => {
  it("90字以内の一文要約になっている（原文をそのまま載せない）", () => {
    const tooLong = all.filter((q) => q.question.length > MAX_QUESTION).map((q) => `${q.slug}:${q.question.length}`);
    expect(tooLong).toEqual([]);
  });

  it("空でなく、疑問の形で終わる", () => {
    for (const q of all) {
      expect(q.question.length, q.slug).toBeGreaterThan(0);
      expect(q.question, q.slug).toMatch(/[か。？]$/u);
    }
  });
});

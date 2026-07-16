import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RESIDENTS } from "../data/residents.ts";
import { publishedTeaTimeQuestions, teaTimeQuestions } from "../data/teaTime.ts";

const CURRENT_DIR = path.join(process.cwd(), "content", "scripts", "current");
const TEA_TIME_RULE_DOC = path.join(process.cwd(), "docs", "09_production", "current_questions.md");
const residentSlugs = new Set(RESIDENTS.map((r) => r.slug));

describe("publishedTeaTimeQuestions", () => {
  it("規約 docs/09_production/current_questions.md を参照できる", () => {
    const rules = readFileSync(TEA_TIME_RULE_DOC, "utf-8");
    expect(rules).toContain("対談プロット");
    expect(rules).toContain("けんかや論破合戦にはしない");
    expect(rules).toContain("結論はいちおう出す");
    expect(rules).toContain("画面には常に喋っている1人だけ");
  });

  it("時事枠なので公開済みは新しい話題ほど上に並ぶ", () => {
    const timestamps = publishedTeaTimeQuestions.map((entry) => {
      expect(entry.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      return Date.parse(`${entry.publishedAt}T00:00:00Z`);
    });
    const sorted = [...timestamps].sort((a, b) => b - a);
    expect(timestamps).toEqual(sorted);
  });

  it("公開済み番号は公開時固定で、表示順から再計算しない", () => {
    const numbers = publishedTeaTimeQuestions.map((entry) => entry.number);
    expect(numbers.every((number) => typeof number === "number" && Number.isInteger(number) && number > 0)).toBe(true);
    expect(new Set(numbers).size).toBe(numbers.length);

    const sorted = [...publishedTeaTimeQuestions].sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
    expect(sorted[0]?.slug).toBe("world-cup");
    expect(sorted[0]?.number).toBe(1);
  });

  it("公開済みと待機中の slug が重複しない", () => {
    const published = new Set(publishedTeaTimeQuestions.map((entry) => entry.slug));
    const duplicates = teaTimeQuestions
      .filter((entry) => published.has(entry.slug))
      .map((entry) => entry.slug);
    expect(duplicates).toEqual([]);
  });

  it("公開済みは3人の既知住人を持つ", () => {
    const bad = publishedTeaTimeQuestions.filter((entry) => {
      const residents = entry.residents ?? [];
      return residents.length !== 3 || residents.some((slug) => !residentSlugs.has(slug));
    });
    expect(bad.map((entry) => entry.slug)).toEqual([]);
  });

  it("公開済みの sceneId は current/*.md の見出しに存在する", () => {
    const missing = publishedTeaTimeQuestions.filter((entry) => {
      const sceneId = entry.sceneId ?? `tea-${entry.slug}`;
      const candidates = [
        path.join(CURRENT_DIR, `${entry.slug}.md`),
        path.join(CURRENT_DIR, `${sceneId.replace(/^tea-/, "")}.md`),
      ];
      return !candidates.some((file) => {
        if (!existsSync(file)) return false;
        return readFileSync(file, "utf-8").includes(`## ${sceneId}:`);
      });
    });
    expect(missing.map((entry) => entry.slug)).toEqual([]);
  });

  it("公開済み脚本はティータイムの演出規約を満たす", () => {
    const bad = publishedTeaTimeQuestions.flatMap((entry) => {
      const sceneId = entry.sceneId ?? `tea-${entry.slug}`;
      const candidates = [
        path.join(CURRENT_DIR, `${entry.slug}.md`),
        path.join(CURRENT_DIR, `${sceneId.replace(/^tea-/, "")}.md`),
      ];
      const file = candidates.find((candidate) => existsSync(candidate));
      if (!file) return [`${entry.slug}:missing-script`];

      const script = readFileSync(file, "utf-8");
      const opening = script.split(/\*\*[^*]+?\*\*/u)[0] ?? script;
      const initialEntrances = opening.match(/^\[登場:/gmu) ?? [];
      const speakerLines = script.match(/^\*\*.+?\*\* \(.+?\):/gmu) ?? [];
      const nonRightSpeakers = speakerLines.filter((line) => !line.includes(", 右):"));

      const errors: string[] = [];
      if (initialEntrances.length !== 1) errors.push(`${entry.slug}:initial-entrance-${initialEntrances.length}`);
      if (speakerLines.length === 0) errors.push(`${entry.slug}:no-speakers`);
      if (nonRightSpeakers.length > 0) errors.push(`${entry.slug}:speaker-not-right`);
      if (!script.includes("[選択]") || !script.includes("→ hub")) errors.push(`${entry.slug}:missing-hub-choice`);
      return errors;
    });

    expect(bad).toEqual([]);
  });
});

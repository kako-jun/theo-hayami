import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RESIDENTS } from "../data/residents.ts";
import {
  findTeaTimeSpeaker,
  TEA_TIME_GUESTS,
  TEA_TIME_SPEAKER_SLUGS,
} from "../data/teaTimeSpeakers.ts";

const PUBLIC_DIR = path.join(process.cwd(), "public");

describe("findTeaTimeSpeaker", () => {
  it("住人 slug は叡智ラベルと theme-residents の顔パスを返す", () => {
    const kantia = findTeaTimeSpeaker("kantia");
    expect(kantia).toBeDefined();
    expect(kantia?.name).toBe("カンティア");
    expect(kantia?.metaLabel).toBe("叡智：認識");
    expect(kantia?.faceSrc).toBe("/images/theme-residents/kantia.webp");
  });

  it("theo は主人公ラベルと bust パスを返す", () => {
    const theo = findTeaTimeSpeaker("theo");
    expect(theo).toBeDefined();
    expect(theo?.name).toBe("せお");
    expect(theo?.metaLabel).toBe("主人公");
    expect(theo?.faceSrc).toBe("/images/theo/bust.webp");
  });

  it("vincia は司会ラベルと bust パスを返す", () => {
    const vincia = findTeaTimeSpeaker("vincia");
    expect(vincia).toBeDefined();
    expect(vincia?.name).toBe("ヴィンチア");
    expect(vincia?.metaLabel).toBe("司会");
    expect(vincia?.faceSrc).toBe("/images/vincia/bust.webp");
  });

  it("未知の slug は undefined を返す", () => {
    expect(findTeaTimeSpeaker("nonexistent")).toBeUndefined();
  });

  it("TEA_TIME_SPEAKER_SLUGS は住人8人とせお・ヴィンチアを含む", () => {
    expect(TEA_TIME_SPEAKER_SLUGS.size).toBe(RESIDENTS.length + TEA_TIME_GUESTS.length);
    for (const r of RESIDENTS) expect(TEA_TIME_SPEAKER_SLUGS.has(r.slug)).toBe(true);
    expect(TEA_TIME_SPEAKER_SLUGS.has("theo")).toBe(true);
    expect(TEA_TIME_SPEAKER_SLUGS.has("vincia")).toBe(true);
  });

  it("全参加者の faceSrc が public/images に実在する", () => {
    const missing = [...RESIDENTS.map((r) => r.slug), ...TEA_TIME_GUESTS.map((g) => g.slug)]
      .map((slug) => findTeaTimeSpeaker(slug))
      .filter((s): s is NonNullable<typeof s> => s !== undefined)
      .filter((s) => !existsSync(path.join(PUBLIC_DIR, s.faceSrc)));
    expect(missing.map((s) => s.slug)).toEqual([]);
  });
});

// けふのティータイムの参加者メタ（住人8人 + せお／ヴィンチア）を解決する純粋関数。
// 名前・役割の正本は docs/02_characters/character_bible.md（せお＝「せおはやみ」主人公、
// 表記は「せお」。ヴィンチア＝司会）。
import { RESIDENTS } from "./residents";

export interface TeaTimeSpeaker {
  slug: string;
  name: string;
  metaLabel: string;
  faceSrc: string;
}

export const TEA_TIME_GUESTS: TeaTimeSpeaker[] = [
  { slug: "theo", name: "せお", metaLabel: "主人公", faceSrc: "/images/theo/bust.webp" },
  { slug: "vincia", name: "ヴィンチア", metaLabel: "司会", faceSrc: "/images/vincia/bust.webp" },
];

export function findTeaTimeSpeaker(slug: string): TeaTimeSpeaker | undefined {
  const resident = RESIDENTS.find((r) => r.slug === slug);
  if (resident) {
    return {
      slug: resident.slug,
      name: resident.name,
      metaLabel: `叡智：${resident.ability}`,
      faceSrc: `/images/theme-residents/${resident.slug}.webp`,
    };
  }
  return TEA_TIME_GUESTS.find((g) => g.slug === slug);
}

export const TEA_TIME_SPEAKER_SLUGS: Set<string> = new Set([
  ...RESIDENTS.map((r) => r.slug),
  ...TEA_TIME_GUESTS.map((g) => g.slug),
]);

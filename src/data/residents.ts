// 住人8人のプロフィール（正本: docs/02_characters/character_bible.md）。
// これは296本のエピソード列挙ではなく、キャラクター8人ぶんの手入力メタデータ（許容範囲）。
// 各住人が「どのお題に答えているか」は src/lib/scripts.ts が content/scripts/free/*.md の
// ファイルスキャンから自動で導出する（ここでは持たない）。
export interface ResidentMeta {
  /** ファイル名・立ち絵ディレクトリのスラッグ（例: "aristo"）。 */
  slug: string;
  /** 人格化名（カタカナ）。 */
  name: string;
  /** 能力名（漢字2文字）。 */
  ability: string;
  /** 思想の一言。 */
  thought: string;
  /** 由来（実在の思想家）。character_bible.md より「発見も残る」意図で明示。 */
  origin: string;
  /** カード・プロフィール文（character_bible.md の口調・役割からの要約）。 */
  blurb: string;
}

export const RESIDENTS: ResidentMeta[] = [
  {
    slug: "aristo",
    name: "アリスト",
    ability: "観察",
    thought: "分類と観察",
    origin: "アリストテレス",
    blurb: "穏やかな博物学者。ものごとを丁寧に分けて並べ、混ざった気持ちをひとつずつ棚に戻してくれる。",
  },
  {
    slug: "kantia",
    name: "カンティア",
    ability: "認識",
    thought: "認識論",
    origin: "カント",
    blurb: "端正で理知的。「それを私は何と呼ぶか」から始め、あいまいな感情に輪郭と名前を与える。",
  },
  {
    slug: "hegru",
    name: "ヘグル",
    ability: "弁証",
    thought: "弁証法",
    origin: "ヘーゲル",
    blurb: "熱く高揚する登山家気質。矛盾を消さずに、もう一段高いところへ一緒に登ってくれる。",
  },
  {
    slug: "dekaris",
    name: "デカリス",
    ability: "懐疑",
    thought: "方法的懐疑",
    origin: "デカルト",
    blurb: "厳格な実験者。目の下の隈と鋭い問いで、疑ってよい前提と疑わなくてよい足場を切り分ける。",
  },
  {
    slug: "spino",
    name: "スピノ",
    ability: "汎神",
    thought: "汎神論",
    origin: "スピノザ",
    blurb: "大らかで詩的。海と波の比喩で、個としての苦しみを大きな全体の中へゆっくり溶かす。",
  },
  {
    slug: "hue",
    name: "ヒュー",
    ability: "経験",
    thought: "経験論",
    origin: "ヒューム",
    blurb: "若く砕けた皮肉屋。理屈より先に「で、実際どうだった？」と経験に立ち返らせる。",
  },
  {
    slug: "makiya",
    name: "マキヤ",
    ability: "現実",
    thought: "現実主義",
    origin: "マキャベリ",
    blurb: "辛口の現実家。理想より効用、建前より「それは実際に使えるのか」で切り込む年長者。",
  },
  {
    slug: "ou",
    name: "オウ",
    ability: "知行",
    thought: "知行合一",
    origin: "王陽明",
    blurb: "沈着で寡黙。「知って動かねば知らぬのと同じだ」と、一番小さな行動へそっと背を押す。",
  },
];

export function findResident(slug: string): ResidentMeta | undefined {
  return RESIDENTS.find((r) => r.slug === slug);
}

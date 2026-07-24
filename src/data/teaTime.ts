export interface TeaTimeQuestion {
  slug: string;
  title: string;
  question: string;
  /** 公開時に固定される通番。公開順ソートで位置が変わってもこの番号は変えない。 */
  number?: number;
  /** 公開済み話題の表示順。時事枠なので新しいものほど上に出す。 */
  publishedAt?: string;
  sceneId?: string;
  /** この話題でお茶の席につく住人のスラッグ（表示順）。未指定＝待機列。 */
  residents?: string[];
}

export const publishedTeaTimeQuestions: TeaTimeQuestion[] = [
  {
    slug: "scandal",
    title: "不祥事を見る",
    question: "不祥事で有名人が消えていく様子を、どう見ればよいでしょうか。",
    number: 6,
    publishedAt: "2026-07-24",
    sceneId: "tea-scandal",
    residents: ["dekaris", "kantia", "hue"],
  },
  {
    slug: "youtube-monetization",
    title: "YouTubeで収益化できる気がしない",
    question:
      "YouTubeで収益化したいのに、条件が難しくなっていてできる気がしないとき、どう考えればよいでしょうか。",
    number: 5,
    publishedAt: "2026-07-19",
    sceneId: "tea-youtube-monetization",
    residents: ["aristo", "makiya", "hue"],
  },
  {
    slug: "unpersuadable",
    title: "説得できない相手",
    question:
      "考え方が大きく違い、説得できない相手と、どう向き合えばよいでしょうか。",
    number: 4,
    publishedAt: "2026-07-18",
    sceneId: "tea-unpersuadable",
    residents: ["aristo", "hegru", "spino"],
  },
  {
    slug: "ai-job",
    title: "人工知能と仕事",
    question: "人工知能に仕事を奪われるかもしれない不安と、どう向き合えばよいでしょうか。",
    number: 3,
    publishedAt: "2026-07-18",
    sceneId: "tea-ai-job",
    residents: ["kantia", "makiya", "ou"],
  },
  {
    slug: "genius",
    title: "天才にはかなわない",
    question: "天才にはかなわないと感じるとき、どう生きればよいでしょうか。",
    number: 2,
    publishedAt: "2026-07-17",
    sceneId: "tea-genius",
    residents: ["kantia", "hue", "dekaris"],
  },
  {
    slug: "world-cup",
    title: "ワールドカップの悔しさ",
    question:
      "ワールドカップで運やけがや判定に泣いた悔しさを、どう受け止めればよいでしょうか。",
    number: 1,
    publishedAt: "2026-07-16",
    sceneId: "tea-wc-luck",
    residents: ["makiya", "spino", "ou"],
  },
];

export function findTeaTimeQuestion(slug: string): TeaTimeQuestion | undefined {
  return publishedTeaTimeQuestions.find((entry) => entry.slug === slug)
    ?? teaTimeQuestions.find((entry) => entry.slug === slug);
}

export const teaTimeQuestions: TeaTimeQuestion[] = [
  { slug: "ai-extinction", title: "人工知能と人類", question: "人工知能が人類を滅ぼすかもしれない恐怖を、どう考えればよいでしょうか。" },
  { slug: "confession", title: "告白する怖さ", question: "好きな人に気持ちを伝えるのが怖いとき、どうすればよいでしょうか。" },
  { slug: "farewell", title: "別れの怖さ", question: "大事な人と別れることが怖いとき、どう受け止めればよいでしょうか。" },
  { slug: "legacy", title: "何を残すか", question: "人生で何を残すべきか分からないとき、何を考えればよいでしょうか。" },
  { slug: "future-seen", title: "先が見えた怖さ", question: "自分の先が見えた気がして怖いとき、どう考え直せばよいでしょうか。" },
  { slug: "death-pain", title: "死ぬ痛み", question: "死ぬときの痛みを想像して怖くなるとき、どう向き合えばよいでしょうか。" },
  { slug: "birth", title: "出産の怖さ", question: "出産が怖いと感じるとき、その不安とどう付き合えばよいでしょうか。" },
  { slug: "media-agitation", title: "報道のあおり", question: "報道や言説のあおりを見るのがつらいとき、どう距離を取ればよいでしょうか。" },
  { slug: "war", title: "戦争がなくならない", question: "戦争がなくならない理由を、どのように考えればよいでしょうか。" },
  { slug: "rich", title: "お金持ちになりたい", question: "お金持ちになりたい気持ちを、どう扱えばよいでしょうか。" },
  {
    slug: "red-ocean",
    title: "激しい競争",
    question: "激しい競争に巻き込まれないためには、何を見ればよいでしょうか。",
  },
  { slug: "parenting", title: "子育ての失敗", question: "子育てに失敗したくない不安と、どう向き合えばよいでしょうか。" },
  {
    slug: "finite-life",
    title: "有限のつらさ",
    question:
      "すべての本を読めず、すべての国にも行けない有限さを、どう受け止めればよいでしょうか。",
  },
  {
    slug: "beyond-life",
    title: "結果を見られないこと",
    question:
      "生きている間に結果を見られないことに、なぜ人は関心を持てるのでしょうか。",
  },
  { slug: "adhd", title: "多動症と生きる", question: "多動症と付き合いながら、どう暮らしていけばよいでしょうか。" },
  { slug: "illness", title: "病気と生きる", question: "病気と付き合いながら、どう生きていけばよいでしょうか。" },
  { slug: "military", title: "軍がなければ", question: "軍がなければ攻められない、という考え方は本当でしょうか。" },
  {
    slug: "national-interest",
    title: "国益に反する政治",
    question:
      "政治家や政党が国益に反するように見える行動を取るのは、なぜでしょうか。",
  },
  { slug: "mob", title: "集団の愚かさ", question: "集団の愚かさを嫌悪してしまうとき、どう受け止めればよいでしょうか。" },
  { slug: "birth-origin", title: "生まれを呪う", question: "自分の生まれを呪ってしまうとき、どう考えればよいでしょうか。" },
  {
    slug: "birth-country",
    title: "生まれる国",
    question: "多くの人が豊かな国に生まれない現実を、どう考えればよいでしょうか。",
  },
  {
    slug: "cosmic-loneliness",
    title: "宇宙の孤独",
    question:
      "宇宙に人間のような存在が必ずいるわけではない現実を、どう受け止めればよいでしょうか。",
  },
  {
    slug: "temperature",
    title: "温度の不思議",
    question:
      "温度の低い限界の近くに私たちがいる不思議を、どう考えればよいでしょうか。",
  },
  { slug: "one-world", title: "世界が一つになること", question: "世界の国が一つになることは、本当に理想なのでしょうか。" },
  {
    slug: "undiagnosed",
    title: "診断されていない病",
    question: "診断されていないだけで心を病んでいる人は多いのではないでしょうか。",
  },
  {
    slug: "immortal-state",
    title: "滅ばない国",
    question: "滅ばない国は作れるのでしょうか。独裁国家が残り続けるのはなぜでしょうか。",
  },
  { slug: "political-hack", title: "制度を読み替える", question: "政治や制度を読み替えて使うとは、どういうことでしょうか。" },
  {
    slug: "failed-work",
    title: "失敗した作品",
    question:
      "失敗した作品を、失敗していないことにする空気をどう受け止めればよいでしょうか。",
  },
  { slug: "discrimination", title: "差別された経験", question: "差別された経験を、これからどう抱えていけばよいでしょうか。" },
  { slug: "competition", title: "商売や試験で勝つ", question: "商売や試験で勝ちたい気持ちを、どう鍛えればよいでしょうか。" },
];

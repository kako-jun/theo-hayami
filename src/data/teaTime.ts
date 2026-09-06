export interface TeaTimeQuestion {
  slug: string;
  title: string;
  question: string;
  /** 一覧と meta description 用の一文要約。相談文が長い（目安90字超）ときに付ける。
   *  詳細ページの引用は常に question 全文を出す。 */
  excerpt?: string;
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
    slug: "puberty-desire",
    title: "汚い自分と先生",
    question:
      "初めてのマスタベーションを経験して、それまで見てきた本や番組や映画などの商業が堂々とおかずを売っていたのだという嫌悪感と、世の中はそれを隠さないものなんだという違和感に驚きました。昼は普通に話しているクラスの同級生も、夜になればお互いの裸を想像し合う同士の関係で、先生ですら行動しないだけで想像の中では生徒を裸にしているかもしれず、それが正常な男の性欲だといいます。理性で抑えているだけで人間は動物なんだということが少し悲しい。これが思春期というものなのでしょうか。自分も先生も汚い。しかしその汚さで自分は生まれ、人間は続いてきたと認めるしかない。誰にも相談できないし、皆はそこまで深く考えず、ただエロいだけに見えます。どう考えればよいでしょうか。",
    excerpt:
      "初めての性欲に気づき、自分も先生も汚いと感じてしまう思春期を、どう考えればよいでしょうか。",
    number: 10,
    publishedAt: "2026-09-07",
    sceneId: "tea-puberty-desire",
    residents: ["kantia", "spino", "hue"],
  },
  {
    slug: "temperature",
    title: "温度の不思議",
    question:
      "温度の低い限界の近くに私たちがいる不思議を、どう考えればよいでしょうか。",
    number: 9,
    publishedAt: "2026-09-06",
    sceneId: "tea-temperature",
    residents: ["hue", "kantia", "theo"],
  },
  {
    slug: "finite-life",
    title: "全部は読めない、行けないつらさ",
    question:
      "すべての本を読めず、すべての国にも行けない有限さを、どう受け止めればよいでしょうか。",
    number: 8,
    publishedAt: "2026-08-10",
    sceneId: "tea-finite-life",
    residents: ["kantia", "hue", "ou"],
  },
  {
    slug: "media-agitation",
    title: "報道のあおり",
    question: "報道や言説のあおりを見るのがつらいとき、どう距離を取ればよいでしょうか。",
    number: 7,
    publishedAt: "2026-07-24",
    sceneId: "tea-media-agitation",
    residents: ["hue", "dekaris", "spino"],
  },
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
  { slug: "war", title: "戦争がなくならない", question: "戦争がなくならない理由を、どのように考えればよいでしょうか。" },
  { slug: "rich", title: "お金持ちになりたい", question: "お金持ちになりたい気持ちを、どう扱えばよいでしょうか。" },
  {
    slug: "red-ocean",
    title: "激しい競争",
    question: "激しい競争に巻き込まれないためには、何を見ればよいでしょうか。",
  },
  { slug: "parenting", title: "子育ての失敗", question: "子育てに失敗したくない不安と、どう向き合えばよいでしょうか。" },
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
  { slug: "child-lies", title: "子どもの嘘", question: "子どもが嘘をつくようになったとき、親はどう向き合えばよいでしょうか。" },
  { slug: "envied-by-friend", title: "喜んでくれない友人", question: "友人が自分の成功を素直に喜んでくれないとき、どう受け止めればよいでしょうか。" },
  { slug: "someone-slacking", title: "身近な人の怠け", question: "身近な人の怠けを、見過ごすべきか、注意すべきでしょうか。" },
  { slug: "family-anger", title: "すぐ怒る家族", question: "家族がすぐ怒るとき、どう接すればよいでしょうか。" },
  { slug: "child-bored", title: "つまらないと言う子", question: "子どもが「つまらない」ばかり言うとき、親は何を渡せばよいでしょうか。" },
  { slug: "cancel-apology", title: "許されない謝罪", question: "謝罪しても許されない空気の中で、どう振る舞えばよいでしょうか。" },
  { slug: "aging-parents-remote", title: "遠くの親の老い", question: "遠くに住む親の老いを画面越しに見守るしかないとき、どう向き合えばよいでしょうか。" },
  { slug: "ai-companion", title: "人工知能という友達", question: "人工知能を相談相手や友達のように感じてしまうのは、おかしいことでしょうか。" },
  { slug: "deepfake-truth", title: "本物が分からない", question: "本物かどうか分からない画像や動画があふれる中で、何を信じればよいでしょうか。" },
  { slug: "algorithm-feed", title: "おすすめに決められる", question: "おすすめ表示に自分の好みを決められている気がするとき、どう抜け出せばよいでしょうか。" },
  { slug: "ai-creativity", title: "人工知能と作る意味", question: "人工知能が絵や文章を作れる時代に、自分が作る意味はあるのでしょうか。" },
  { slug: "oshi-katsu", title: "推しに注ぐ", question: "推しにお金と時間を注ぐ自分を、後ろめたく思うべきでしょうか。" },
  { slug: "anonymous-self", title: "匿名の自分", question: "匿名で書く自分と実名の自分、どちらが本当の自分なのでしょうか。" },
  { slug: "parasocial-breakup", title: "幻滅した作り手", question: "好きだった配信者や作家の言動に幻滅したとき、作品まで嫌いになるべきでしょうか。" },
  { slug: "digital-legacy", title: "死後に残る投稿", question: "自分が死んだ後もアカウントや投稿が残ることを、どう考えればよいでしょうか。" },
  { slug: "attention-span", title: "集中できない", question: "長い文章や映画に集中できなくなった自分を、どう考えればよいでしょうか。" },
  { slug: "vote-meaningless", title: "一票の意味", question: "一票で何も変わらない気がするとき、投票に行く意味はあるのでしょうか。" },
  { slug: "rating-fatigue", title: "星で評価される", question: "星の数で人を評価し、評価されることに疲れたとき、どう考えればよいでしょうか。" },
  { slug: "trading-card-boom", title: "高騰するカード", question: "ポケカや遊戯王のカードがものすごく高騰しています。その値段でも買う人は実際にゲームで使うのか、ただのコレクターなのか。それでゲームはいいのか、作っている人はそれでいいのか。そのカードがなくても勝てるのに。いろんな楽しみ方は自由なのか。複雑な気持ちです。どう考えればよいでしょうか。", excerpt: "高騰するカードを買う人と、それでも成り立つゲームを、どう考えればよいでしょうか。" },
  { slug: "lover-ex-nearby", title: "恋人の元恋人が近くにいる", question: "初めての恋人ができて嬉しいのに、恋人の元恋人が近くにいて、恋人の裸を知る人が私のほかにもいると思うと耐えられず、故郷を離れたいほどです。生き物として自然な嫌悪なら従ってよいのでしょうか。", excerpt: "初めての恋人の元恋人が近くにいて耐えられない気持ちに、従ってよいのでしょうか。" },
  { slug: "partner-past", title: "恋人の過去の不倫", question: "付き合っている恋人が、過去に不倫をしたことがあると正直に打ち明けてきました。問いただすと、相手は私も知っている人で、誰かは知らないほうがいい、どうしても知りたいなら言う、と言われました。それから胃が痛み、周りの全員が疑わしく見えて、金田一の犯人推理を現実で味わうような悪夢です。知らないままでいるのは無理で、中途半端が一番苦しい。恋人はひどいと思うのに、正直さでまだ付き合っていたい。私はきっと誰かを聞くでしょう。恋人とは縁を切らず、その相手とは二度と接点を持ちようがない世界にいきたい。どうすればよいでしょうか。", excerpt: "恋人の過去の不倫相手を知りたいのに縁は切りたくないとき、どうすればよいでしょうか。" },
  { slug: "solo-comfort", title: "一人が楽、と言われても", question: "一人でいるのが楽で、恋愛をしたいと思えません。「それでいい」と言ってくれる本や番組は多いのですが、焦るべきときに焦る自由を奪われている気もします。年を取ってから後悔した人の話は表に出てきません。どう考えればよいでしょうか。", excerpt: "一人が楽で恋愛したいと思えない自分に、「それでいい」と言ってよいのでしょうか。" },
  { slug: "long-running-boredom", title: "面白くない長期連載", question: "ワンピースやコナンやアメリカの連続ドラマが、周りやテレビは面白いと言うのに、私には全く面白く感じられません。鬼滅や呪術廻戦やチェンソーマンはどれも面白かったのに。引き伸ばして続ける商業主義と、作家性のために短く駆け抜ける作り手の二種類がいるのでしょうか。売れているのは本当でしょうが、周りにワンピースを全巻持っている人はいないし、ジャンプも百万部を切ったといいます。それがドラゴンボールと対等とか上とか言われるとむかつきます。この気持ちをどう整理すればいいでしょうか。", excerpt: "周りが面白いという長期連載を面白く感じられない気持ちを、どう整理すればよいでしょうか。" },
  { slug: "bleached-blockbusters", title: "漂白された映画", question: "スターウォーズが大好きで、４５６も１２３も好きです。７８９も期待していましたが、８がひどすぎて９は見ていません。大勢の人間が絶対に失敗できない予算をかけるのに、少数の脚本家の思想が入り込み、旧作や設定も知らない人に権限を与えて大損しているように見えます。多くのレビューサイトもそう書いているので私だけではないでしょう。日本ではタバコを吸うアニメや天皇暗殺すら創作のテーマとして自由なのに、西洋ではタブーだらけです。子どもを大人と連続でなく未熟で守るべきものと扱う価値観の違いで、最終的にはキリスト教に行き着くと聞きました。本当でしょうか。もしそうなら、ジョージ・ルーカスのような少数の変人が好きに作れない現代では、もう西洋では漂白されたつまらない映画しか生まれないのではないでしょうか。", excerpt: "大作映画がタブーだらけで漂白されていくように見えるのは、本当なのでしょうか。" },
  { slug: "comiket-desire", title: "祭典の後ろめたさ", question: "コミケは楽しいしすごい文化だと思いますが、実質売っているのはエロ本で、作者が決して描かないキャラの裸を非公式で売って稼いでいる場です。「収穫」と言葉を濁していますが、その夜からマスタベーションに使うための絵で、世界最大のマスタベーションの祭典なのかもしれません。グレーゾーンというのは著作権もそうですが、女性の性欲をさらけ出している人数が多いから怖くない、というグレーにも感じます。私はそれに違和感と罪悪感があり、集団心理にまかせるまま平気なふりをしていていいのかと思います。それに、人気が出れば作者にも間接的にお金が入るとか、コミケを好きな作者もいるとか、一部の人を挙げて正当化する側も、嫌なら作者が二次創作禁止と言えばいい、と増長した一部の人を挙げて批判する側も、どんな争いもそうかもしれませんが、互いの弱点を狙うのが定石だからと、それぞれの一番あほな一部を狙って批判したり利用したりする姿が、漫画をただ読む楽しさと比べて純粋でなく、醜いと感じます。ルネサンスと同じで、裸や性欲を隠さないことは人間賛歌と考えればいいのでしょうか。都合が良すぎないか、と悩んでいます。", excerpt: "同人誌の祭典で欲望を隠さない集団の中で感じる罪悪感を、人間賛歌と考えてよいのでしょうか。" },
];

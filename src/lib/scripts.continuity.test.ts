import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MAIN_DIR = path.join(process.cwd(), "content", "scripts", "main");
const FREE_DIR = path.join(process.cwd(), "content", "scripts", "free");
const CURRENT_DIR = path.join(process.cwd(), "content", "scripts", "current");

function mainScript(file: string): string {
  return readFileSync(path.join(MAIN_DIR, file), "utf-8");
}

function freeScript(file: string): string {
  return readFileSync(path.join(FREE_DIR, file), "utf-8");
}

function currentScript(file: string): string {
  return readFileSync(path.join(CURRENT_DIR, file), "utf-8");
}

describe("main story continuity", () => {
  it("act2-01 does not misattribute the hologram explanation to セオ", () => {
    const act1 = mainScript("act1-01.md");
    const act2 = mainScript("act2-01.md");

    expect(act1).toContain("**ヴィンチア** (vincia/explain, 右):\nホログラム、と言えばいいかな。");
    expect(act2).not.toContain("きみは、前にも言っていたね。ホログラムだったんだ、って。");
    expect(act2).toContain("前に、僕は言ったね。きみのいた現実は、ホログラムのような投影だった、って。");
  });

  it("keeps unshown past references from becoming direct quotes or repeated visits", () => {
    expect(mainScript("act2-02.md")).not.toMatch(/いつも、スピノが座ってた|いつも座ってた|いつも、ここへ来る/u);

    const act2_03 = mainScript("act2-03.md");
    expect(act2_03).not.toContain("戻らんぞ");
    expect(act2_03).not.toContain("「さあ、どうだろうね」って");
    expect(act2_03).toContain("初めて会ったときみたいな軽さがなくて");

    expect(mainScript("act3-01.md")).not.toContain("きのう聞いた言葉");
    expect(mainScript("act2-01.md")).not.toMatch(/昨日と同じ|昨日と、同じ/u);
    expect(mainScript("act3-01.md")).not.toContain("昨日と違う");
    expect(mainScript("act2-01.md")).toContain("前に見たときと同じ数");
    expect(mainScript("act3-01.md")).toContain("前に見たときと違う");
  });

  it("keeps Vincia's identity reveal in act3-04 instead of act3-03", () => {
    const act3_03 = mainScript("act3-03.md");
    const act3_04 = mainScript("act3-04.md");

    expect(act3_03).not.toContain("僕は黒幕ではない");
    expect(act3_03).not.toContain("好奇心、と呼んでもいい");
    expect(act3_03).toContain("次は、真相を聞く番だ");

    expect(act3_04).toContain("僕は黒幕ではない");
    expect(act3_04).toContain("好奇心、と呼んでもいい");
  });

  it("keeps Dekaris's doubt as Seo's own reasoning in act3-02", () => {
    const act3_02 = mainScript("act3-02.md");
    expect(act3_02).toContain("デカリスに会ってから、わかったんだ");
    expect(act3_02).toContain("自分の安心も、きみの優しさも疑う");
    expect(act3_02).not.toContain("デカリスなら、そう言うだろう");
  });

  it("keeps ending anchors and character voice constraints", () => {
    expect(mainScript("act4-03.md")).toContain("見えているはずなのに、端が欠けてる");
    expect(mainScript("act4-04.md")).toContain("この物語で語られたことを、まず疑え");
    expect(mainScript("ohako-makiya.md")).not.toContain("わし");
    expect(mainScript("ohako-hue.md")).not.toContain("ぼくの言うこと");
    expect(mainScript("ohako-hegru.md")).not.toContain("覚えておおき");
  });

  it("keeps late-story afterimages from reading as physical resident returns", () => {
    const act2_02 = mainScript("act2-02.md");
    const act3_04 = mainScript("act3-04.md");
    const act4_01 = mainScript("act4-01.md");
    const act4_04 = mainScript("act4-04.md");

    expect(act2_02).toContain("「いなくなる、ってどういうことなんだろう」");
    expect(act2_02).not.toContain("「消えるって、どういうことなんだろう」");
    expect(act3_04).toContain("残った声を追う → act4-01");
    expect(act3_04).not.toContain("最後の住人に会う → act4-01");
    expect(act4_01).not.toMatch(/\[登場: (ヒュー|オウ)/u);
    expect(act4_01).toContain("言葉になりきる前で止まる");
    expect(act4_01).toContain("知ることは、体のどこかが少し変わって、はじめてボクのものになる");
    expect(act4_04).toContain("ヒューの余韻");
    expect(act4_04).not.toContain("ヒューの沈黙");
    expect(act4_04).toContain("[イベント絵: story/act4/theo-returning-event-horizon.webp, 背面=hide]");
    expect(act4_04).toContain("現実がどこかにあるなら、きっとそこは、答えのある場所じゃない");
    expect(act4_04).toContain("さあ、行こう。まだ見えない明日へ--");
  });

  it("keeps philosophy explanations away from common distortions", () => {
    const kantia = mainScript("ohako-kantia.md");
    const spino = mainScript("ohako-spino.md");
    const hegru = mainScript("ohako-hegru.md");
    const makiya = mainScript("ohako-makiya.md");

    expect(kantia).toContain("君の認識から独立した顔そのものが在るとしても");
    expect(kantia).toContain("そのまま知ることはできない");
    expect(kantia).not.toContain("両者は等しく『本物』だ");
    expect(spino).toContain("別の場所で再会できるという意味でなく");
    expect(spino).not.toContain("全体に還るだけのこと");
    expect(hegru).toContain("これは弁証の入口だ");
    expect(hegru).not.toContain("好きが嫌いを呼び、嫌いが好きを深める");
    expect(makiya).toContain("手段を選ぶときは、正しそうに見えるかだけで測るな");
    expect(makiya).not.toContain("手段にまで正しさを求めるな");
  });

  it("keeps free action and tea-time philosophy away from common distortions", () => {
    const aiJob = currentScript("ai-job.md");
    const wcLuck = currentScript("wc-luck.md");
    const genius = currentScript("genius.md");
    const unpersuadable = currentScript("unpersuadable.md");
    const ouRonpa = freeScript("ronpa__ou.md");
    const spinoJikan = freeScript("jikan__spino.md");
    const kantiaShi = freeScript("shi__kantia.md");
    const hegruRonpa = freeScript("ronpa__hegru.md");
    const ouAi = freeScript("ai__ou.md");
    const ouJiyuu = freeScript("jiyuu__ou.md");
    const kantiaFuan = freeScript("fuan__kantia.md");
    const kantiaDouchou = freeScript("douchou__kantia.md");
    const hueWakattete = freeScript("wakattete__hue.md");
    const dekarisYurushi = freeScript("yurushi__dekaris.md");
    const dekarisSoushitsu = freeScript("soushitsu__dekaris.md");
    const ouTadashisa = freeScript("tadashisa__ou.md");
    const ouMayoi = freeScript("mayoi__ou.md");
    const hegruMoke = freeScript("moke__hegru.md");
    const makiyaGensou = freeScript("gensou__makiya.md");
    const aristoFushin = freeScript("fushin__aristo.md");
    const aristoImi = freeScript("imi__aristo.md");
    const dekarisAi = freeScript("ai__dekaris.md");
    const dekarisShi = freeScript("shi__dekaris.md");
    const hueFukushuu = freeScript("fukushuu__hue.md");
    const hueZaiakukan = freeScript("zaiakukan__hue.md");
    const kantiaZaiakukan = freeScript("zaiakukan__kantia.md");
    const makiyaKitai = freeScript("kitai__makiya.md");
    const makiyaFushin = freeScript("fushin__makiya.md");
    const ouTaikutsu = freeScript("taikutsu__ou.md");
    const ouShuuchaku = freeScript("shuuchaku__ou.md");
    const ouShi = freeScript("shi__ou.md");
    const spinoDouchou = freeScript("douchou__spino.md");
    const spinoIkari = freeScript("ikari__spino.md");
    const hegruAseri = freeScript("aseri__hegru.md");
    const hegruGensou = freeScript("gensou__hegru.md");
    const hegruMayoi = freeScript("mayoi__hegru.md");
    const hegruKoufuku = freeScript("koufuku__hegru.md");
    const hegruAi = freeScript("ai__hegru.md");
    const kantiaMoke = freeScript("moke__kantia.md");

    expect(aiJob).toContain("その怖さを、そのまま良知と呼ぶな");
    expect(aiJob).not.toContain("良知はもう働いている。何かを守るべきだと、心が知っている");
    expect(aiJob).not.toContain("人工知能そのものを物自体として恐れている");
    expect(wcLuck).toContain("悔しさは、まだ良知そのものではない");
    expect(wcLuck).not.toContain("悔しいと感じたなら、もう知っている");
    expect(wcLuck).toContain("完全な受動に飲まれたままではない");
    expect(wcLuck).not.toContain("もうきみは受動の側にいない");
    expect(genius).toContain("芸術や創作について言えば、天才とは");
    expect(genius).toContain("その意味での天才を、人生全体の判決にしてはならない");
    expect(unpersuadable).toContain("自分の一面性も、相手の一面性も否定にさらし");
    expect(unpersuadable).not.toContain("境界を引き直し、同じ場を保ち、次の理解へ進む契機");
    expect(ouRonpa).toContain("私的な札ではない");
    expect(ouRonpa).toContain("問うたら事の上で磨け");
    expect(ouRonpa).not.toContain("それで、足りる");
    expect(spinoJikan).toContain("個人の魂が、そのまま時間の外に残るという話ではない");
    expect(spinoJikan).not.toContain("きみの精神には、過ぎ去らない部分があるんだよ");
    expect(kantiaShi).toContain("あの世の地図ではなく、認識の限界線だ");
    expect(kantiaShi).not.toContain("観測の届かぬそれを、私は『物自体』と呼ぶ");
    expect(hegruRonpa).toContain("ただ足して薄めるんじゃない");
    expect(hegruRonpa).not.toContain("相手のぶんも足して");
    expect(ouAi).toContain("湧いた情をそのまま良知と呼ぶな");
    expect(ouAi).not.toContain("愛は、人に生まれつき具わった、よし・あしを判ずる心");
    expect(ouJiyuu).toContain("私欲を省いてなお残る是非");
    expect(ouJiyuu).not.toContain("考え込む前に、ぱっと分かった是非");
    expect(kantiaFuan).toContain("まだ経験されていない");
    expect(kantiaFuan).not.toContain("可能な経験の地平、と呼ぶ。そして君が覗こうとしている");
    expect(kantiaDouchou).toContain("共有可能かを、自分で問う");
    expect(kantiaDouchou).not.toContain("各自が、合わせるのだ");
    expect(hueWakattete).toContain("知識だけからは出てこない");
    expect(hueWakattete).toContain("事実と手段を見せて、情念の進む道を変えることはできる");
    expect(hueWakattete).not.toContain("知識の側には一グラムも入ってない");
    expect(dekarisYurushi).toContain("悪意だったかどうかは、まだ明晰判明じゃない");
    expect(dekarisYurushi).not.toContain("悪意じゃない、構造だ");
    expect(dekarisSoushitsu).toContain("特徴や関係として捉え直す頭");
    expect(dekarisSoushitsu).not.toContain("本体は、お前の頭の中に、まるごと残っている");
    expect(ouTadashisa).toContain("私欲の曇りを払ったとき");
    expect(ouTadashisa).not.toContain("外の声を、ひとつ残らず脇へ置いて");
    expect(ouMayoi).toContain("考えを、一番小さな一事で確かめればいい");
    expect(ouMayoi).not.toContain("探して選ぶな。動けば、わかる");
    expect(hegruMoke).toContain("本人たちの意図を超えて");
    expect(hegruMoke).toContain("制度や全体の中で媒介されれば");
    expect(hegruMoke).not.toContain("欲のまま動いて、気づけば理想");
    expect(makiyaGensou).toContain("欲と打算は見落とすな");
    expect(makiyaGensou).not.toContain("人を実際に動かしているものは、たいてい二つきり");
    expect(aristoFushin).toContain("個別の事例を多く観察し");
    expect(aristoFushin).not.toContain("少ない事例をいくつも観て");
    expect(aristoImi).toContain("人間の働き、理性に従う活動");
    expect(aristoImi).not.toContain("どの部分にも、無駄なものは一つも無い");
    expect(dekarisAi).toContain("情念として結びつきが起こる");
    expect(dekarisAi).not.toContain("お前が、自分の意志で結んだんだ");
    expect(dekarisShi).toContain("身体の故障と同じ語では扱えない");
    expect(dekarisShi).not.toContain("欠けも壊れもしないものは、ほどけようがない");
    expect(hueFukushuu).toContain("互いの所有や期待を安定させる黙約");
    expect(hueFukushuu).not.toContain("正義が発明される前の、生のままのきみ");
    expect(hueZaiakukan).toContain("共通の視点から眺めたとき");
    expect(hueZaiakukan).not.toContain("きみの胸の感じが、そのまま「悪い」");
    expect(kantiaZaiakukan).toContain("君を責めている声を、そのまま信じるな");
    expect(kantiaZaiakukan).not.toContain("君を責めている声の正体は、それなんだ");
    expect(makiyaKitai).toContain("願望だけでは、人は変わらん");
    expect(makiyaKitai).not.toContain("過去が、いちばん正確な予言書");
    expect(makiyaFushin).toContain("何で動く相手か");
    expect(makiyaFushin).not.toContain("裏切る奴は、最初から裏切ると決まっている");
    expect(ouTaikutsu).toContain("花が無いと言っているのではない");
    expect(ouTaikutsu).not.toContain("花は、きみの心の外にあるのではない");
    expect(ouShuuchaku).toContain("善悪を消すという意味ではない");
    expect(ouShuuchaku).not.toContain("良いとも悪いとも言わずに");
    expect(ouShi).toContain("仁の働きの中で他者と地続きにある");
    expect(ouShi).not.toContain("ぷつんと抜け落ちる「ボク」なんて、はじめから無かった");
    expect(spinoDouchou).toContain("その理解が新しい原因になる");
    expect(spinoDouchou).not.toContain("きみが決められる");
    expect(spinoIkari).toContain("妥当な理解によって");
    expect(spinoIkari).not.toContain("選んで動ける能動");
    expect(hegruAseri).toContain("時代の客観的な状況と媒介");
    expect(hegruAseri).not.toContain("彼らの幕は、彼らの時代に、ちゃんと用意されていた");
    expect(hegruGensou).toContain("個人のきみと世界が文字通り同じ一人になる、という話じゃない");
    expect(hegruGensou).not.toContain("同じ、一人なんだよ");
    expect(hegruMayoi).toContain("両方の一面性を否定し");
    expect(hegruMayoi).not.toContain("もとの一枚に戻る");
    expect(hegruKoufuku).toContain("しあわせの比喩として借りよう");
    expect(hegruKoufuku).not.toContain("しあわせも、これと同じ顔をしている");
    expect(hegruAi).toContain("家族は、気持ちの融合だけではない");
    expect(hegruAi).not.toContain("これを僕は、いちばん近くで結ばれた「わたしたち」--家族と呼ぶ");
    expect(kantiaMoke).toContain("その格率を万人の法として意志できるか");
    expect(kantiaMoke).toContain("無条件の形式を『定言命法』");
    expect(kantiaMoke).not.toContain("あるなら、それが君の道徳だ");
  });
});

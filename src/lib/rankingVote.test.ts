import { describe, expect, it } from "vitest";
import { RESIDENTS } from "../data/residents.ts";
import {
  buildRankingGetUrl,
  buildRankingSubmitUrl,
  buildResidentRankingRows,
  EXTRA_VOTE_TARGETS,
  findCurrentScore,
  formatVoteWaitMessage,
  mergeRankingEntries,
  NOSTALGIC_API_BASE,
  parseVoteRateLimitSeconds,
  RANKING_ID,
  type RankingEntry,
  VOTE_TARGETS,
} from "./rankingVote.ts";

// rankingVote は Nostalgic Ranking の get→+1→submit フローを支える純粋関数群（Issue #131）。
// widget が読めない住人の顔をこちら側で自前レンダリングするため、行データ組み立て・現在値検索・
// URL組み立て・429文言パースの4系統を、実データの罠（欠損score・重複名・記号を含む名前）ごと守る。

describe("EXTRA_VOTE_TARGETS", () => {
  it("せお・ヴィンチアの2件、slug/nameが正しい（Issue #131追記: 2人だって住人だ）", () => {
    expect(EXTRA_VOTE_TARGETS).toEqual([
      { slug: "theo", name: "せお" },
      { slug: "vincia", name: "ヴィンチア" },
    ]);
  });
});

describe("VOTE_TARGETS", () => {
  it("RESIDENTS(8件)+EXTRA_VOTE_TARGETS(2件)=10件になる", () => {
    expect(RESIDENTS).toHaveLength(8);
    expect(VOTE_TARGETS).toHaveLength(10);
  });

  it("RESIDENTSに続けてEXTRA_VOTE_TARGETSの順で並ぶ", () => {
    const slugs = VOTE_TARGETS.map((target) => target.slug);
    expect(slugs).toEqual([...RESIDENTS.map((resident) => resident.slug), "theo", "vincia"]);
  });
});

describe("findCurrentScore", () => {
  it("一致するnameがあればそのscoreを返す", () => {
    const entries: RankingEntry[] = [{ name: "アリスト", score: 5 }];
    expect(findCurrentScore(entries, "アリスト")).toBe(5);
  });

  it("entriesが空配列なら0を返す", () => {
    expect(findCurrentScore([], "アリスト")).toBe(0);
  });

  it("一致するnameが無ければ0を返す", () => {
    const entries: RankingEntry[] = [{ name: "アリスト", score: 5 }];
    expect(findCurrentScore(entries, "スピノ")).toBe(0);
  });

  it("事故パターン最重点: 既に投票済み（score>0）の住人を正しく見つけて現在値を返す", () => {
    const entries: RankingEntry[] = [
      { name: "スピノ", score: 1 },
      { name: "アリスト", score: 3 },
      { name: "テオ", score: 7 },
    ];
    expect(findCurrentScore(entries, "アリスト")).toBe(3);
  });

  it("一致エントリのscoreが0でも「未一致の0」と区別なく0を返す", () => {
    const entries: RankingEntry[] = [{ name: "アリスト", score: 0 }];
    expect(findCurrentScore(entries, "アリスト")).toBe(0);
  });

  it("防御的ケース: 一致エントリのscoreが欠落（型を満たさない実データ想定）でも0にフォールバックする", () => {
    const entries = [{ name: "アリスト" }] as unknown as RankingEntry[];
    expect(findCurrentScore(entries, "アリスト")).toBe(0);
  });

  it("事故パターン回帰: 名前が部分一致する別エントリがあっても完全一致する方だけを見る", () => {
    const entries: RankingEntry[] = [
      { name: "アリスト2", score: 9 },
      { name: "アリスト", score: 4 },
    ];
    expect(findCurrentScore(entries, "アリスト")).toBe(4);
  });

  it("データ不整合: 同名の重複エントリがある場合は最初の一致を返す", () => {
    const entries: RankingEntry[] = [
      { name: "アリスト", score: 2 },
      { name: "アリスト", score: 8 },
    ];
    expect(findCurrentScore(entries, "アリスト")).toBe(2);
  });

  it("i18n: 空文字nameを渡しても該当エントリが無ければ0", () => {
    const entries: RankingEntry[] = [{ name: "アリスト", score: 5 }];
    expect(findCurrentScore(entries, "")).toBe(0);
  });
});

describe("buildResidentRankingRows", () => {
  it("正常系: 住人全員のscoreをentriesから正しくマージし、score降順で返す", () => {
    const residents = [
      { slug: "aristo", name: "アリスト" },
      { slug: "spino", name: "スピノ" },
      { slug: "theo", name: "テオ" },
    ];
    const entries: RankingEntry[] = [
      { name: "アリスト", score: 2 },
      { name: "スピノ", score: 9 },
      { name: "テオ", score: 5 },
    ];
    expect(buildResidentRankingRows(residents, entries)).toEqual([
      { slug: "spino", name: "スピノ", score: 9 },
      { slug: "theo", name: "テオ", score: 5 },
      { slug: "aristo", name: "アリスト", score: 2 },
    ]);
  });

  it("境界-1: residentsが空配列なら[]を返す", () => {
    expect(buildResidentRankingRows([], [])).toEqual([]);
  });

  it("境界: residentsが1件のみでも正しく1行返す", () => {
    const residents = [{ slug: "aristo", name: "アリスト" }];
    const entries: RankingEntry[] = [{ name: "アリスト", score: 3 }];
    expect(buildResidentRankingRows(residents, entries)).toEqual([
      { slug: "aristo", name: "アリスト", score: 3 },
    ]);
  });

  it("境界+1: residentsが2件で降順ソートが機能する最小構成", () => {
    const residents = [
      { slug: "aristo", name: "アリスト" },
      { slug: "spino", name: "スピノ" },
    ];
    const entries: RankingEntry[] = [
      { name: "アリスト", score: 1 },
      { name: "スピノ", score: 4 },
    ];
    expect(buildResidentRankingRows(residents, entries)).toEqual([
      { slug: "spino", name: "スピノ", score: 4 },
      { slug: "aristo", name: "アリスト", score: 1 },
    ]);
  });

  it("同点ソート安定性（明示要求項目）: 全員score0のとき、順序はresidents引数の宣言順を維持する", () => {
    const residents = [
      { slug: "theo", name: "テオ" },
      { slug: "aristo", name: "アリスト" },
      { slug: "spino", name: "スピノ" },
    ];
    expect(buildResidentRankingRows(residents, [])).toEqual([
      { slug: "theo", name: "テオ", score: 0 },
      { slug: "aristo", name: "アリスト", score: 0 },
      { slug: "spino", name: "スピノ", score: 0 },
    ]);
  });

  it("同点ソート安定性: 一部が同点・一部が異なるとき、同点グループ内は宣言順を保ちグループ間はscore降順", () => {
    const residents = [
      { slug: "a", name: "A" },
      { slug: "b", name: "B" },
      { slug: "c", name: "C" },
      { slug: "d", name: "D" },
    ];
    const entries: RankingEntry[] = [
      { name: "A", score: 3 },
      { name: "B", score: 5 },
      { name: "C", score: 3 },
      { name: "D", score: 1 },
    ];
    expect(buildResidentRankingRows(residents, entries)).toEqual([
      { slug: "b", name: "B", score: 5 },
      { slug: "a", name: "A", score: 3 },
      { slug: "c", name: "C", score: 3 },
      { slug: "d", name: "D", score: 1 },
    ]);
  });

  it("異常系: entriesにresidentsに存在しない名前が混入していても無視され、rows数はresidents数と一致する", () => {
    const residents = [{ slug: "aristo", name: "アリスト" }];
    const entries: RankingEntry[] = [
      { name: "アリスト", score: 2 },
      { name: "架空の住人", score: 100 },
    ];
    const rows = buildResidentRankingRows(residents, entries);
    expect(rows).toHaveLength(1);
    expect(rows).toEqual([{ slug: "aristo", name: "アリスト", score: 2 }]);
  });

  it("防御的: 入力のresidents配列を破壊的に変更しない", () => {
    const residents = [
      { slug: "aristo", name: "アリスト" },
      { slug: "spino", name: "スピノ" },
    ];
    const original = [...residents];
    const entries: RankingEntry[] = [
      { name: "アリスト", score: 1 },
      { name: "スピノ", score: 9 },
    ];
    buildResidentRankingRows(residents, entries);
    expect(residents).toEqual(original);
  });
});

describe("mergeRankingEntries", () => {
  it("正常系: updatedに含まれる住人はupdated側の値で上書きされる", () => {
    const cached: RankingEntry[] = [{ name: "アリスト", score: 2 }];
    const updated: RankingEntry[] = [{ name: "アリスト", score: 5 }];
    expect(mergeRankingEntries(cached, updated)).toEqual([{ name: "アリスト", score: 5 }]);
  });

  it("should-3の本題: updatedに含まれない住人はcachedの値をそのまま保持する（丸ごと置換にしない）", () => {
    const cached: RankingEntry[] = [
      { name: "アリスト", score: 2 },
      { name: "スピノ", score: 9 },
    ];
    // submitが上位10件だけを返す想定で、スピノがたまたま含まれないケース。
    const updated: RankingEntry[] = [{ name: "アリスト", score: 3 }];
    expect(mergeRankingEntries(cached, updated)).toEqual([
      { name: "アリスト", score: 3 },
      { name: "スピノ", score: 9 },
    ]);
  });

  it("正常系: updatedにしか無い新規住人は追加される", () => {
    const cached: RankingEntry[] = [{ name: "アリスト", score: 2 }];
    const updated: RankingEntry[] = [
      { name: "アリスト", score: 2 },
      { name: "スピノ", score: 1 },
    ];
    expect(mergeRankingEntries(cached, updated)).toEqual([
      { name: "アリスト", score: 2 },
      { name: "スピノ", score: 1 },
    ]);
  });

  it("境界: cachedが空配列ならupdatedがそのまま返る", () => {
    const updated: RankingEntry[] = [{ name: "アリスト", score: 1 }];
    expect(mergeRankingEntries([], updated)).toEqual(updated);
  });

  it("境界: updatedが空配列ならcachedがそのまま返る（この呼び出しでは何も上書きされない）", () => {
    const cached: RankingEntry[] = [{ name: "アリスト", score: 4 }];
    expect(mergeRankingEntries(cached, [])).toEqual(cached);
  });

  it("境界-1: 両方空配列なら空配列", () => {
    expect(mergeRankingEntries([], [])).toEqual([]);
  });

  it("順序: cachedの並び順を維持しつつ、updated限定の新規住人は末尾に追加される", () => {
    const cached: RankingEntry[] = [
      { name: "テオ", score: 7 },
      { name: "アリスト", score: 2 },
    ];
    const updated: RankingEntry[] = [
      { name: "アリスト", score: 3 },
      { name: "スピノ", score: 1 },
    ];
    expect(mergeRankingEntries(cached, updated)).toEqual([
      { name: "テオ", score: 7 },
      { name: "アリスト", score: 3 },
      { name: "スピノ", score: 1 },
    ]);
  });

  it("防御的: 入力のcached/updated配列を破壊的に変更しない", () => {
    const cached: RankingEntry[] = [{ name: "アリスト", score: 2 }];
    const updated: RankingEntry[] = [{ name: "アリスト", score: 5 }];
    const cachedSnapshot = [...cached];
    const updatedSnapshot = [...updated];
    mergeRankingEntries(cached, updated);
    expect(cached).toEqual(cachedSnapshot);
    expect(updated).toEqual(updatedSnapshot);
  });
});

describe("parseVoteRateLimitSeconds", () => {
  it("正常系: 想定文言から秒数を取り出す（1桁）", () => {
    expect(parseVoteRateLimitSeconds("Please wait 5 seconds before voting again")).toBe(5);
  });

  it("正常系: 2桁の秒数も取り出せる", () => {
    expect(parseVoteRateLimitSeconds("Please wait 12 seconds before voting again")).toBe(12);
  });

  it("境界: 文言完全一致（アンカー基準点）", () => {
    expect(parseVoteRateLimitSeconds("Please wait 3 seconds before voting again")).toBe(3);
  });

  it("境界-1: 先頭に余分な1文字があると不一致でnull（^アンカー）", () => {
    expect(parseVoteRateLimitSeconds("xPlease wait 3 seconds before voting again")).toBeNull();
  });

  it("境界+1: 末尾に余分な1文字があると不一致でnull（$アンカー）", () => {
    expect(parseVoteRateLimitSeconds("Please wait 3 seconds before voting againx")).toBeNull();
  });

  it("異常系: 空文字はnull", () => {
    expect(parseVoteRateLimitSeconds("")).toBeNull();
  });

  it("API失敗系: 共通レートリミッタの別文言はマッチせずnullを返す", () => {
    expect(parseVoteRateLimitSeconds("Rate limit exceeded. Please try again later.")).toBeNull();
  });

  it("異常系: 大文字小文字の違い（先頭pleaseが小文字）は不一致でnull", () => {
    expect(parseVoteRateLimitSeconds("please wait 3 seconds before voting again")).toBeNull();
  });

  it("異常系: 数字であるべき箇所が英単語だと不一致でnull", () => {
    expect(parseVoteRateLimitSeconds("Please wait five seconds before voting again")).toBeNull();
  });
});

describe("formatVoteWaitMessage", () => {
  it("正常系: 秒数を埋め込んだ案内文を組み立てる", () => {
    expect(formatVoteWaitMessage(5)).toBe("あと5秒待ってから投票してください");
  });
});

describe("buildRankingGetUrl / buildRankingSubmitUrl", () => {
  it("正常系: 実際の呼び出し値でURLが正しく組み立つ", () => {
    expect(buildRankingGetUrl(RANKING_ID, 100)).toBe(
      `${NOSTALGIC_API_BASE}/ranking?action=get&id=${RANKING_ID}&limit=100`
    );
  });

  it("i18n（明示要求項目）: カタカナの住人名がencodeURIComponentされ、生の日本語文字が残らない", () => {
    const url = buildRankingSubmitUrl(RANKING_ID, "スピノ", 1);
    expect(url).not.toContain("スピノ");
    const nameParam = new URL(url).searchParams.get("name");
    expect(nameParam).toBe("スピノ");
  });

  it("文字種混在/事故パターン: 名前に&を含む場合でもクエリパラメータが分断されず%26にエンコードされる", () => {
    const url = buildRankingSubmitUrl(RANKING_ID, "A&B", 1);
    expect(url).toContain("name=A%26B");
    const params = new URL(url).searchParams;
    expect(params.get("name")).toBe("A&B");
    expect(params.get("score")).toBe("1");
  });

  it("異常系: idが空文字でもクラッシュせずURLを組み立てる（id=という空パラメータになる）", () => {
    const url = buildRankingGetUrl("", 100);
    expect(url).toBe(`${NOSTALGIC_API_BASE}/ranking?action=get&id=&limit=100`);
  });

  it("合成テスト最重点: findCurrentScoreの戻り値を+1してbuildRankingSubmitUrlに渡した結果が現在値+1のscoreを含む", () => {
    const entries: RankingEntry[] = [{ name: "アリスト", score: 4 }];
    const nextScore = findCurrentScore(entries, "アリスト") + 1;
    const url = buildRankingSubmitUrl(RANKING_ID, "アリスト", nextScore);
    expect(new URL(url).searchParams.get("score")).toBe("5");
  });
});

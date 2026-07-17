// Nostalgic Ranking（推したい住人ランキング）投票ロジックの純粋関数（Issue #131）。
//
// kako-jun の指摘（Issue #131追記）: `<nostalgic-ranking>` の read-only widgetは
// name/score/rankのテキストのみで住人の顔を出せずピンとこないため、widget表示は廃止し
// ランキングは完全に自前レンダリングへ切り替えた。API とのやり取り（get→+1→submit）は
// widget時代のロジックをそのまま流用し、住人8人を正本に行データを組み立てる関数を追加する。
//
// fetch・DOM操作（連投中のボタン無効化・行の並べ替え等）は community.astro 側に残し、
// 判定・URL組み立て・行データ組み立てだけをここに切り出してテスト可能にする
// （dev-doctrine: 索引・判定ロジックは.astroに埋め込まず、可能な範囲で純粋関数に切り出す）。
//
// 実装前に以下を実際に読んで確認した内容を前提にしている（当て推量禁止のため）:
// - https://nostalgic.llll-ll.com/components/ranking.js （read-onlyの表示専用コンポーネント）
// - repos/2025/nostalgic/apps/api/src/routes/ranking.ts の action=submit 実装:
//   - submit は「新スコアが既存より上回るときだけ更新」の UPSERT。現在値を知らずに
//     単純上書きするとスコアを減らしてしまえるため、必ず get で現在値を取ってから +1 する。
//   - 連投レート制限は5秒・IP+UA単位（投票する名前に関係なくユーザー単位）。
//     429時のエラーボディは固定の英語文言 `Please wait {N} seconds before voting again`
//     （ranking.js内のi18nはウィジェット自身の読み込みエラー表示用で、直接叩くAPIの
//     レスポンス文言とは別物）。

export const NOSTALGIC_API_BASE = "https://api.nostalgic.llll-ll.com";

/** Nostalgic 側で作成済みの「推したい住人ランキング」ID。再作成不要（Issue #131）。 */
export const RANKING_ID = "theo-hayami-fc727d17";

/**
 * 住人8人（RESIDENTS）に加えて投票対象へ含める追加エントリ（Issue #131追記）。
 * kako-jun 指示: 「2人だって住人だ」という世界観解釈で、せお・ヴィンチアも投票対象に含める。
 * name は scripts の話者タグと同じ表記（せお／ヴィンチア）を使う。
 * frontmatter（community.astro）と client script（同ファイル内 <script>）は
 * Astro上で別モジュールとして評価されるため、両方から参照できるようここへ置く。
 */
export const EXTRA_VOTE_TARGETS: { slug: string; name: string }[] = [
  { slug: "theo", name: "せお" },
  { slug: "vincia", name: "ヴィンチア" },
];

export interface RankingEntry {
  name: string;
  score: number;
}

/** 現在のエントリ一覧から対象名の現在スコアを探す。未登録なら0（新規投票扱い）。 */
export function findCurrentScore(entries: RankingEntry[], name: string): number {
  return entries.find((entry) => entry.name === name)?.score ?? 0;
}

export interface ResidentRankingRow {
  slug: string;
  name: string;
  score: number;
}

/**
 * 住人一覧（`RESIDENTS`）を正本に、APIのランキングエントリをマージしてスコア降順で返す。
 * 住人は増減しない前提で常に全員ぶん返す（API側にまだ投票が無い住人は0点扱い）。
 * `.sort()` は安定ソートなので同点者は `residents` の元の並び順を保つ。
 */
export function buildResidentRankingRows(
  residents: { slug: string; name: string }[],
  entries: RankingEntry[]
): ResidentRankingRow[] {
  return residents
    .map((resident) => ({
      slug: resident.slug,
      name: resident.name,
      score: findCurrentScore(entries, resident.name),
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * submit応答に含まれる更新後エントリで、キャッシュ済みエントリをマージする。
 *
 * サーバー側の `action=submit` は常に上位 `RANKING.LIMIT.DEFAULT`（=10件）だけを返す
 * （クライアントから件数指定できない）。現状は `maxEntries=10` と一致し住人8人が全員
 * 含まれるため実害はないが、将来 `maxEntries` を引き上げた場合に応答が上位10件だけに
 * なりうる。その場合に「丸ごと置換」すると11位以下の住人がキャッシュから消え、
 * その住人への次回投票が score=0 起点の無言no-op（サーバーのUPSERTは新スコアが既存より
 * 上回るときだけ更新するため）を起こす。
 *
 * そのため updated に含まれる住人だけ上書きし、含まれない住人は cached の値を保持する。
 */
export function mergeRankingEntries(cached: RankingEntry[], updated: RankingEntry[]): RankingEntry[] {
  const merged = new Map<string, RankingEntry>();
  for (const entry of cached) merged.set(entry.name, entry);
  for (const entry of updated) merged.set(entry.name, entry);
  return [...merged.values()];
}

/** ランキング取得（`action=get`）APIのURLを組み立てる。 */
export function buildRankingGetUrl(id: string, limit: number): string {
  return `${NOSTALGIC_API_BASE}/ranking?action=get&id=${encodeURIComponent(id)}&limit=${limit}`;
}

/** スコア投稿（`action=submit`、UPSERT）APIのURLを組み立てる。 */
export function buildRankingSubmitUrl(id: string, name: string, score: number): string {
  return `${NOSTALGIC_API_BASE}/ranking?action=submit&id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&score=${score}`;
}

const VOTE_RATE_LIMIT_PATTERN = /^Please wait (\d+) seconds before voting again$/;

/** 429エラーメッセージ（API固定の英語文言）から残り秒数を取り出す。一致しなければnull。 */
export function parseVoteRateLimitSeconds(message: string): number | null {
  const match = VOTE_RATE_LIMIT_PATTERN.exec(message);
  return match ? Number(match[1]) : null;
}

/** 残り秒数から案内文を組み立てる（Issue #131 指定文言）。 */
export function formatVoteWaitMessage(seconds: number): string {
  return `あと${seconds}秒待ってから投票してください`;
}

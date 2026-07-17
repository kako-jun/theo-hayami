// Nostalgic Ranking（好きな住人ランキング）投票ロジックの純粋関数（Issue #131）。
//
// ranking.js の embed component は read-only（表示専用）で投票UIを持たないため、
// community.astro が自前の fetch で投票フローを組む。fetch・DOM操作（連投中の
// ボタン無効化・ウィジェットの再読み込み等）は .astro 側のスクリプトに残し、
// 判定・URL組み立てだけをここに切り出してテスト可能にする
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

/** Nostalgic 側で作成済みの「好きな住人ランキング」ID。再作成不要（Issue #131）。 */
export const RANKING_ID = "theo-hayami-fc727d17";

export interface RankingEntry {
  name: string;
  score: number;
}

/** 現在のエントリ一覧から対象名の現在スコアを探す。未登録なら0（新規投票扱い）。 */
export function findCurrentScore(entries: RankingEntry[], name: string): number {
  return entries.find((entry) => entry.name === name)?.score ?? 0;
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

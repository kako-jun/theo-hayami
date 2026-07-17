// フルスクリーン制御の判定・選択ロジック（Issue #61）。
//
// ReaderFrame.astro の script は「読む」「全画面で読む」の2ボタン分岐と、終劇（story-ended）
// 受信時の fullscreen 復帰判定を持つ。標準API（requestFullscreen/exitFullscreen/
// fullscreenElement）と webkit接頭辞版（Safari等）のどちらを使うかという分岐・優先順位判定を
// 純粋関数として切り出し、vitest（environment: "node"）から直接テストできるようにする
// （dev-doctrine: 索引・判定ロジックは純粋関数に切り出す。readStore.ts / pwa-update.ts と同じ流儀）。
//
// DOM要素・Document自体の型はブラウザ標準の型に依存させず、必要なメソッドだけを持つ最小形で
// 受け取る。テストは実DOMを用意せず fake object を渡すだけで検証できる。

/** requestFullscreen を持ちうる要素の最小形（iframe等）。 */
export interface FullscreenRequestTarget {
  requestFullscreen?: () => Promise<void> | void;
  webkitRequestFullscreen?: () => Promise<void> | void;
}

/**
 * 要素から呼ぶべき fullscreen 要求関数を選ぶ。標準API優先、なければwebkit接頭辞、
 * 両方無ければ undefined（呼び出し側で「非対応環境」としてフォールバックする）。
 * 選んだ関数は el に bind して返す（DOM API は正しい receiver で呼ばないと
 * illegal invocation になるため、参照だけ取り出しても呼べない）。
 */
export function pickFullscreenRequestFn(
  el: FullscreenRequestTarget,
): (() => Promise<void> | void) | undefined {
  if (el.requestFullscreen) return el.requestFullscreen.bind(el);
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen.bind(el);
  return undefined;
}

/**
 * fullscreen 状態から抜けるべきか（＝現在何らかの要素が fullscreen 中か）を判定する。
 * 標準/webkit いずれかが真値なら true（Issue #61: 「全画面で読む」経由の時だけ復帰処理をする。
 * 埋め込み経由＝そもそも fullscreen でない場合は両方 falsy になり no-op になる）。
 */
export function shouldExitFullscreen(fullscreenElement: unknown, webkitFullscreenElement: unknown): boolean {
  return Boolean(fullscreenElement) || Boolean(webkitFullscreenElement);
}

/** exitFullscreen を持ちうる Document の最小形。 */
export interface FullscreenExitTarget {
  exitFullscreen?: () => Promise<void> | void;
  webkitExitFullscreen?: () => Promise<void> | void;
}

/** pickFullscreenRequestFn と対称の exit 版。標準API優先、なければwebkit接頭辞。 */
export function pickExitFullscreenFn(doc: FullscreenExitTarget): (() => Promise<void> | void) | undefined {
  if (doc.exitFullscreen) return doc.exitFullscreen.bind(doc);
  if (doc.webkitExitFullscreen) return doc.webkitExitFullscreen.bind(doc);
  return undefined;
}

/** ReaderFrame.astro が生成する iframe に設定すべき属性値。 */
export interface ReaderIframeAttrs {
  allow: string;
  allowFullscreen: boolean;
  webkitallowfullscreen: string;
}

/**
 * 「読む」「全画面で読む」どちらの入口でも同一の iframe を生成するための属性セット。
 * fullscreen ボタンから iframe.requestFullscreen() を呼べるよう許可しておく必要がある
 * （Issue #61）ため、両ボタンで常に同じ値を使うことをここに固定する。
 *
 * 「読む」（埋め込み専用）経由の iframe にも allow="autoplay; fullscreen" /
 * allowfullscreen が常時付与されるのは意図的な設計判断: 同一オリジンの信頼済み
 * コンテンツ（name-name）であり、name-name 自体が fullscreen を自発的に要求する
 * コードを持たないため実害はない。ボタンごとに属性を出し分けるより、単一の
 * createIframe() を維持して DRY を優先する。
 */
export function buildReaderIframeAttrs(): ReaderIframeAttrs {
  return {
    allow: "autoplay; fullscreen",
    allowFullscreen: true,
    webkitallowfullscreen: "true",
  };
}

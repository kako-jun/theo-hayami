/// <reference lib="webworker" />
// Issue #59: mypace（repos/2025/mypace/apps/web/src/sw.ts）と同じ最小構成。
// push通知・share targetはtheo-hayami（静的読み物サイト）には不要なので持ち込まない。
//
// 重要: navigateFallback 相当の「未一致ナビゲーションを / に束ねる」処理は絶対に足さない。
// このサイトは /free/<業>__<住人> 等を多数持つマルチページ静的サイトで、hanoba #291/#538 では
// そうした処理が原因で個別ページがトップページにすり替わる実害が出た。precacheAndRoute だけなら
// 各URLが個別にプリキャッシュされ、未一致は通常のネットワークナビゲーションになるためこの問題は起きない。
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

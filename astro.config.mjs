import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// theo-hayami サイト（Issue #20）。完全静的・バックエンドレス。
// 会話劇の描画そのものは持たない。各「読むページ」(/free/*) が name-name
// （別リポ・PixiJSノベルエンジン）を <iframe> で遅延埋め込みするだけ。
// 技術的precedent: 同時期の hanoba（Astro + @tailwindcss/vite + output:"static" + Cloudflare Pages）。
// hanoba と違い Nostr/PWA は不要なので @astrojs/react・@vite-pwa/astro は持ち込まない。
export default defineConfig({
  site: "https://theo-hayami.llll-ll.com",
  output: "static",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});

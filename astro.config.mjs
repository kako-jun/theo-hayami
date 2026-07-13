import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// theo-hayami サイト（Issue #20）。完全静的・バックエンドレス。
// 会話劇の描画そのものは持たない。各「読むページ」(/free/*) が name-name
// （別リポ・PixiJSノベルエンジン）を <iframe> で遅延埋め込みするだけ。
// 技術的precedent: 同時期の hanoba（Astro + @tailwindcss/vite + output:"static" + Cloudflare Pages）。
// hanoba と違い Nostr/PWA は不要なので @astrojs/react・@vite-pwa/astro は持ち込まない。
// Issue #62: フッタの版表示 `vYYYY-MM-DD`（JST基準）は package.json の "build" スクリプトが
// `PUBLIC_BUILD_DATE=$(TZ=Asia/Tokyo date +%Y-%m-%d)` をシェルで注入し、
// SiteFooter.astro の frontmatter が process.env.PUBLIC_BUILD_DATE を直接読む。
// astro.config.mjs 側で process.env を書き換える／vite.define で注入する方式は、
// Astro が output:"static" のプリレンダーの過程で本ファイルを command の値を変えて
// 複数回再評価し、後の呼び出しが先の書き換えを上書きしてしまうため不採用（実機で確認済み）。
export default defineConfig({
  site: "https://theo-hayami.llll-ll.com",
  output: "static",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});

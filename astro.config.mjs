import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import AstroPWA from "@vite-pwa/astro";
import { defineConfig } from "astro/config";

// theo-hayami サイト（Issue #20）。完全静的・バックエンドレス。
// 会話劇の描画そのものは持たない。各「読むページ」(/free/*) が name-name
// （別リポ・PixiJSノベルエンジン）を <iframe> で遅延埋め込みするだけ。
// 技術的precedent: 同時期の hanoba（Astro + @tailwindcss/vite + output:"static" + Cloudflare Pages）。
// React island は不要（会話劇の描画自体を持たないため）だが、PWA化はした（Issue #59）。
// hanoba は generateSW+workbox設定・registerType:"autoUpdate" だが、本サイトは
// mypace（repos/2025/mypace/apps/web）方式に揃え、injectManifest + registerType:"prompt" +
// src/sw.ts の手書きSW + virtual:pwa-register の手動 registerSW（更新overlay＋自動reload）にする。
// Issue #62: フッタの版表示 `vYYYY-MM-DD`（JST基準）は package.json の "build" スクリプトが
// `PUBLIC_BUILD_DATE=$(TZ=Asia/Tokyo date +%Y-%m-%d)` をシェルで注入し、
// SiteFooter.astro の frontmatter が process.env.PUBLIC_BUILD_DATE を直接読む。
// astro.config.mjs 側で process.env を書き換える／vite.define で注入する方式は、
// Astro が output:"static" のプリレンダーの過程で本ファイルを command の値を変えて
// 複数回再評価し、後の呼び出しが先の書き換えを上書きしてしまうため不採用（実機で確認済み）。
export default defineConfig({
  site: "https://theo-hayami.llll-ll.com",
  output: "static",
  integrations: [
    sitemap(),
    AstroPWA({
      registerType: "prompt",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      // LibraryLayout.astro が `virtual:pwa-register` を自前で import して手動 registerSW() する
      // ため、プラグイン側の自動登録スクリプト（デフォルト "auto"）は無効化する。Astro の
      // ビルドはクライアントバンドル用と静的プリレンダー用で Vite の実行が分かれており、
      // "auto" の「ソース中の import 使用を検出して自動登録を止める」ヒューリスティックが
      // そのプリレンダー側の実行には伝播しない（実機で確認済み＝ dist/registerSW.js が
      // 素の register() 版として二重生成された）。明示的に false にして二重登録を防ぐ。
      injectRegister: false,
      injectManifest: {
        // 画像（webp/png）は含めない。サイト全体の背景画像だけで35MB超（296組の読むページが
        // それぞれ全画面背景を持つ）あり、SW install 時に全部precacheすると初回が重すぎる上、
        // workbox の既定 maximumFileSizeToCacheInBytes（2MiB）を超える個別画像（例:
        // images/reality/city.png 2.57MB）があると injectManifest がビルドエラーで落ちる
        // （実機で確認済み）。js/css/html（アプリシェル）だけを precache し、本文の生成絵は
        // 通常のネットワークナビゲーション＋ブラウザHTTPキャッシュに任せる。
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
      },
      manifest: {
        name: "せおはやみ",
        short_name: "せおはやみ",
        description: "「叡智の星海」──人類の知見が蓄えられた星海に迷い込んだ読書体験",
        id: "/",
        start_url: "/",
        scope: "/",
        // theme_color と background_color は同一値にする。html/body の実背景も同じ
        // --color-th-ink-deep（#0a0910・最暗）なので、スプラッシュ→本描画の切り替えで
        // 色が変わらず継ぎ目が出ない。両者を別値にすると Android スプラッシュのステータスバー
        // （theme_color）と本体（background_color）の境目に薄い線が出る（hanoba #478 の教訓）。
        theme_color: "#0a0910",
        background_color: "#0a0910",
        display: "standalone",
        lang: "ja",
        // 192/512 の PNG（purpose=any）2つだけに絞る。maskable・SVGエントリは入れない。
        // Android起動スプラッシュでアイコン周囲に薄い枠が出る既知不具合の回避
        // （hanoba #511/#513 で確定した原因＝ purpose:any の PNG 2つ以外を持たないと枠が出ない）。
        icons: [
          { src: "/favicon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/favicon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        ],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

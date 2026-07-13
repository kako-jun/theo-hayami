// Issue #62: 版表示 `vYYYY-MM-DD` 用のビルド日。package.json の "build" スクリプトが
// シェルで process.env.PUBLIC_BUILD_DATE に設定する（SiteFooter.astro の frontmatter が
// Node の実行時参照として読む。astro dev では未設定＝"dev" にフォールバックする）。
declare namespace NodeJS {
  interface ProcessEnv {
    PUBLIC_BUILD_DATE?: string;
  }
}

// assets/images/（住人立ち絵・影の図書館背景。git管理の正本）を public/images/ へ複製する。
//
// なぜ symlink でなく copy か: public/ は astro dev のファイル配信にも astro build の
// dist コピーにも使われるが、シンボリックリンクの追従は環境（OS/CI）依存で壊れやすい。
// 生成物として public/images/ を毎回作り直す方が確実（.gitignore 済み・正本は assets/images）。
import { cpSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = new URL("../assets/images/", import.meta.url);
const dest = new URL("../public/images/", import.meta.url);

const srcPath = fileURLToPath(src);
const destPath = fileURLToPath(dest);

if (!existsSync(srcPath)) {
  console.error(`[sync-assets] assets/images が見つかりません: ${srcPath}`);
  process.exit(1);
}

// 古い複製を消してから焼き直す（assets 側でファイルが削除された場合に public 側へ残らないため）。
if (existsSync(destPath)) {
  rmSync(destPath, { recursive: true, force: true });
}
cpSync(srcPath, destPath, { recursive: true });

console.log(`[sync-assets] assets/images/ -> public/images/ を同期しました (${root})`);

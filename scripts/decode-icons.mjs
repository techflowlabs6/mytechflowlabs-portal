/**
 * Decode the PWA icons from their base64 sources.
 *
 * The icons live in the repo as public/icon-*.png.b64 (plain text) and are
 * decoded to public/icon-*.png by this script, which runs automatically
 * before every build (`prebuild` in package.json) — so Vercel, local
 * builds and the preview server all get real PNG icons without the
 * binaries living in git. The PNGs themselves are git-ignored; delete
 * them any time, they come back on the next build.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));

for (const size of [192, 512]) {
  const source = path.join(root, "public", `icon-${size}.png.b64`);
  const target = path.join(root, "public", `icon-${size}.png`);
  const base64 = fs.readFileSync(source, "utf8").replace(/\s+/g, "");
  const bytes = Buffer.from(base64, "base64");
  // Sanity check: a real PNG starts with the 8-byte PNG signature.
  if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`icon-${size}.png.b64 is not a valid PNG.`);
  }
  fs.writeFileSync(target, bytes);
  console.log(`decoded public/icon-${size}.png (${bytes.length} bytes)`);
}

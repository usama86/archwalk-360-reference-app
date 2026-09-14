// Derive rectilinear stills from a demo-owned equirectangular panorama.
// Usage: node scripts/prepare-property-photos.mjs /path/to/pano1.jpg
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
const require = createRequire(import.meta.url);
const sharp = require(require.resolve("sharp", { paths: [require.resolve("next/package.json")] }));
if (!process.argv[2]) throw new Error("Supply the safe demo panorama source path.");
const { data, info } = await sharp(process.argv[2]).removeAlpha().raw().toBuffer({ resolveWithObject: true });
await mkdir("public/property", { recursive: true });
for (const [name, yawDegrees, width, height, fov] of [
  ["living-area", -40, 1400, 1000, 95],
  ["lounge-detail", 0, 900, 650, 75],
  ["kitchen-detail", 105, 900, 650, 75],
]) {
  const pixels = Buffer.alloc(width * height * 3);
  const scale = Math.tan(fov * Math.PI / 360);
  const yaw = yawDegrees * Math.PI / 180;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const dx = (2 * (x + 0.5) / width - 1) * scale;
    const dy = (1 - 2 * (y + 0.5) / height) * scale * height / width;
    const longitude = Math.atan2(dx, 1) + yaw;
    const latitude = Math.atan2(dy, Math.sqrt(1 + dx * dx));
    const sx = ((longitude / (2 * Math.PI) + 0.5) * info.width + info.width) % info.width;
    const sy = Math.max(0, Math.min(info.height - 1, (0.5 - latitude / Math.PI) * info.height));
    const x0 = Math.floor(sx), y0 = Math.floor(sy), x1 = (x0 + 1) % info.width, y1 = Math.min(y0 + 1, info.height - 1);
    const fx = sx - x0, fy = sy - y0;
    for (let c = 0; c < 3; c++) {
      const sample = (px, py) => data[(py * info.width + px) * 3 + c];
      pixels[(y * width + x) * 3 + c] = (sample(x0, y0) * (1 - fx) + sample(x1, y0) * fx) * (1 - fy) + (sample(x0, y1) * (1 - fx) + sample(x1, y1) * fx) * fy;
    }
  }
  await sharp(pixels, { raw: { width, height, channels: 3 } }).webp({ quality: 85 }).toFile(`public/property/${name}.webp`);
}

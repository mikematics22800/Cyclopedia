import fs from 'fs';
import path from 'path';

/** Matches on-disk names: AL012004_Alex → AL01_Alex */
export function archiveImageStemFromStormId(id: string): string | null {
  const m = id.match(/^(AL|EP|CP)(\d{2})\d{4}_(.+)$/i);
  return m ? `${m[1]}${m[2]}_${m[3]}` : null;
}

/** stem (no extension) → filename with extension */
export function buildArchiveImageStemMap(imagesDir: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!fs.existsSync(imagesDir)) return map;
  for (const name of fs.readdirSync(imagesDir)) {
    const full = path.join(imagesDir, name);
    if (!fs.statSync(full).isFile()) continue;
    const stem = path.basename(name, path.extname(name));
    map.set(stem, name);
  }
  return map;
}

export function localArchiveImagePath(
  cwd: string,
  basin: string,
  year: string,
  file: string,
): string | null {
  if (
    file.includes('..') ||
    file.includes('/') ||
    file.includes('\\') ||
    !/\.(jpe?g|png|gif|webp|svg)$/i.test(file)
  ) {
    return null;
  }
  const base = path.resolve(path.join(cwd, 'archive', basin, year, 'images'));
  const resolved = path.resolve(path.join(base, file));
  const rel = path.relative(base, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    return null;
  }
  return resolved;
}

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

export function mimeForImageFile(file: string): string {
  const ext = path.extname(file).toLowerCase();
  return MIME[ext] ?? 'application/octet-stream';
}

import { cpSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'archive');
const dest = join(root, 'public/archive');

if (!existsSync(source)) {
  console.warn('Archive data not found; skipping copy.');
  process.exit(0);
}

mkdirSync(dest, { recursive: true });
cpSync(source, dest, { recursive: true });
console.log('Copied archive data to public/archive');

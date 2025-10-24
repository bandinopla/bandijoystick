import fs from 'fs';
import path from 'path';

export function copyFolder(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    entry.isDirectory()
      ? copyFolder(srcPath, destPath)
      : fs.copyFileSync(srcPath, destPath);
  }
}
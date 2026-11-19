import { globSync, readFileSync } from 'node:fs';
import path from 'node:path';

// Markers that must be gone before the site goes live. The fake contact URLs
// carry no visible marker, so they are listed on their own.
const markers = [
  '[PLACEHOLDER]',
  'example.it',
  'instagram.com/example',
  'facebook.com/example',
  '+390000000000',
];
// A robots meta with noindex, whatever the attribute order or extra directives:
// each meta tag is matched whole, then checked for both parts.
const metaTagPattern = /<meta\b[^>]*>/gi;
const robotsNamePattern = /\bname=["']?robots["']?/i;
const hasNoindexMeta = (content) =>
  (content.match(metaTagPattern) ?? []).some(
    (tag) => robotsNamePattern.test(tag) && /noindex/i.test(tag),
  );
// A not-found page must never be indexed, so its noindex is allowed to stay.
const noindexAllowed = new Set(['404.html']);
// Only text files can carry a marker; binaries (fonts, images) are skipped.
const textExtensions = new Set([
  '.html',
  '.css',
  '.js',
  '.mjs',
  '.json',
  '.xml',
  '.txt',
  '.svg',
  '.webmanifest',
]);

// Directory to scan: optional first argument, default `dist` in the project root.
const root = path.resolve(import.meta.dirname, '..');
const dir = path.resolve(root, process.argv[2] ?? 'dist');

const files = globSync('**/*', { cwd: dir, withFileTypes: true })
  .filter((entry) => entry.isFile() && textExtensions.has(path.extname(entry.name).toLowerCase()))
  .map((entry) => path.join(entry.parentPath, entry.name));

if (files.length === 0) {
  console.error(`No text files found in ${dir}, run \`npm run build\` first.`);
  process.exit(1);
}

// Collect every file that still contains at least one marker, with the markers found.
const offenders = files
  .map((file) => {
    const content = readFileSync(file, 'utf8');
    const relative = path.relative(dir, file).split(path.sep).join('/');
    const found = markers.filter((marker) => content.includes(marker));
    if (hasNoindexMeta(content) && !noindexAllowed.has(relative)) found.push('noindex');
    return { file, found };
  })
  .filter(({ found }) => found.length > 0);

if (offenders.length > 0) {
  console.error('Release check failed, placeholder or noindex markers found:');
  for (const { file, found } of offenders) {
    console.error(`  ${path.relative(root, file)}: ${found.join(', ')}`);
  }
  process.exit(1);
}

console.log(`Release check passed: ${files.length} files, no placeholder or noindex markers.`);

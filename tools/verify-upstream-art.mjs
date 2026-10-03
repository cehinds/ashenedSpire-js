// Verify the vendored high-resolution base without rejecting experimental additions.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalBytes } from './art-manifest.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestFile = resolve(root, 'art/upstream-hd-assets-v3/art-manifest.json');
const raw = readFileSync(manifestFile);
const hash = data => createHash('sha256').update(data).digest('hex');
// Immutable release-asset digest, checked before trusting its file records.
if (hash(raw) !== '92f370644e61e3d6cbe4e3127e9e900703fc94cc2ddb3241b8786961784be150') {
  throw new Error('The upstream release manifest digest has changed');
}
const manifest = JSON.parse(raw);
let verified = 0;
for (const [id, entry] of Object.entries(manifest.assets)) {
  if (!entry.high) continue;
  const record = entry.high;
  const file = resolve(root, record.path);
  if (!file.startsWith(resolve(root, 'assets') + sep)) throw new Error(`Unsafe art path: ${id}`);
  const bytes = canonicalBytes(file);
  if (bytes.length !== record.bytes || hash(bytes) !== record.sha256) {
    throw new Error(`Upstream high-resolution art differs: ${record.path}`);
  }
  verified++;
}
if (verified !== 5410) throw new Error(`Expected 5410 high-resolution files; checked ${verified}`);
console.log(`Verified ${verified} full-resolution files against AshenSpire-art hd-assets-v3.`);

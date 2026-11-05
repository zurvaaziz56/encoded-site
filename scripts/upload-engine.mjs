// One-time setup: upload the encoded-kit-builder engine to YOUR Anthropic account as a private skill.
// The engine itself stays out of this public repository; only the skill ID goes into Vercel.
//
// Usage (on your own computer, in an empty folder):
//   npm install @anthropic-ai/sdk
//   ANTHROPIC_API_KEY=sk-ant-... node upload-engine.mjs /path/to/encoded-kit-builder
// Then copy the printed ID into Vercel as KIT_BUILDER_SKILL_ID.
// To publish a new engine version later, run it again and update the ID (or keep "latest").
import Anthropic, { toFile } from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
if (!dir || !fs.existsSync(path.join(dir, 'SKILL.md'))) {
  console.error('Pass the path to the encoded-kit-builder folder (the one containing SKILL.md).');
  process.exit(1);
}
const top = path.basename(path.resolve(dir));
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.name.startsWith('.') ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);

const files = await Promise.all(walk(dir).map(async f =>
  toFile(fs.readFileSync(f), `${top}/${path.relative(dir, f).split(path.sep).join('/')}`)));

const client = new Anthropic();
const skill = await client.skills.create({ files, display_name: 'Encoded kit builder' });
console.log(`Uploaded ${files.length} files.`);
console.log(`KIT_BUILDER_SKILL_ID=${skill.id}`);

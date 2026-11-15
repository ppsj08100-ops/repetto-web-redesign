import { cp, mkdir, rm, stat } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const output = new URL('../dist/', import.meta.url);
const files = ['index.html', 'src', 'assets'];
for (const file of files) await stat(new URL(file, root));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of files) await cp(new URL(file, root), new URL(file, output), { recursive: true });
console.log('Built dist/ — static site ready.');

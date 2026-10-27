import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { parse } from 'yaml';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const read = path => readFileSync(join(root, path), 'utf8');
export const yaml = path => parse(read(path));
export function markdown(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  assert(match, 'Markdown requires YAML frontmatter');
  return { data: parse(match[1]), body: source.slice(match[0].length) };
}
export function entries(collection) {
  return readdirSync(join(root, 'src/content', collection)).filter(name => name.endsWith('.md')).map(name => ({
    slug: name.slice(0, -3), ...markdown(read(`src/content/${collection}/${name}`)),
  }));
}
export function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
export function decode(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#(\d+)|#x([\da-f]+));/gi, (match, decimal, hex) => {
    if (decimal || hex) return String.fromCodePoint(parseInt(decimal || hex, hex ? 16 : 10));
    return { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' }[match.toLowerCase()] ?? match;
  });
}
export function tags(html) {
  return [...html.replace(/<!--[^]*?-->/g, '').matchAll(/<([a-z][\w:-]*)\b([^<>]*?)>/gi)].map(([, name, source]) => ({
    name: name.toLowerCase(),
    attrs: Object.fromEntries([...source.matchAll(/([^\s=/'"<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)].map(([, key, double, single, bare]) => [key.toLowerCase(), decode(double ?? single ?? bare ?? '')])),
  }));
}

import assert from 'node:assert/strict';
import { readFileSync, readdirSync, realpathSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { z } from 'astro/zod';
import { resolve, sep } from 'node:path';
import { parse } from 'yaml';
import { contentSchemas, siteSchema, navigationSchema, skillsSchema } from '../src/config/schemas.mjs';

// Explicit editor schemas prevent unrelated filename-based YAML schema associations.
mkdirSync('src/config/editor-schemas', { recursive: true });
for (const [name, schema] of Object.entries({ site: siteSchema, navigation: navigationSchema, skills: skillsSchema })) {
  writeFileSync(`src/config/editor-schemas/${name}.json`, JSON.stringify(z.toJSONSchema(schema), null, 2) + '\n');
}

const yaml = path => parse(readFileSync(path, 'utf8'));
siteSchema.parse(yaml('src/config/site.yaml'));
navigationSchema.parse(yaml('src/config/navigation.yaml'));
skillsSchema.parse(yaml('src/content/skills.yaml'));
const imageRoot = realpathSync('public/images');
let count = 0;
let images = 0;
function checkImage(value, field) {
  if (value === undefined) return;
  const path = realpathSync(resolve('public', value.slice(1)));
  assert(path.startsWith(imageRoot + sep) && statSync(path).isFile(), `${field}: image must be a file within public/images`);
  assert(!readFileSync(path).subarray(0, 128).toString('utf8').startsWith('version https://git-lfs.github.com/spec/v1'), `${field}: image is an unresolved Git LFS pointer; run git lfs pull`);
  images++;
}
for (const [collection, schema] of Object.entries(contentSchemas)) {
  const directory = `src/content/${collection}`;
  const files = readdirSync(directory).sort();
  assert(files.length > 0, `${directory}: empty collection`);
  if (collection === 'profile') assert.deepEqual(files, ['about.md']);
  const orders = new Set();
  const ids = new Set();
  for (const file of files) {
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(file), `${directory}/${file}: expected a slug-named Markdown file`);
    const source = readFileSync(`${directory}/${file}`, 'utf8');
    const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
    assert(match, `${directory}/${file}: missing YAML frontmatter`);
    const data = schema.parse(parse(match[1]));
        if (collection !== 'certificates') assert(source.slice(match[0].length).trim(), `${directory}/${file}: Markdown body must not be empty`);
    const id = file.slice(0, -3);
    assert(!ids.has(id), `${directory}: duplicate ID ${id}`);
    ids.add(id);
    if ('order' in data) {
      assert(!orders.has(data.order), `${directory}: duplicate order ${data.order}`);
      orders.add(data.order);
    }
    for (const field of ['avatar', 'cover', 'caseStudy']) checkImage(data[field], `${directory}/${file}.${field}`);
    // Validate Markdown image destinations as well as frontmatter assets.
    for (const image of source.slice(match[0].length).matchAll(/!\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
      assert(image[1].startsWith('/images/'), `${directory}/${file}: Markdown images must be local`);
      assert(!image[1].split('/').includes('..') && !/[?#%\\]/.test(image[1]), `${directory}/${file}: unsafe image path`);
      checkImage(image[1], `${directory}/${file}`);
    }
    count++;
  }
}
console.log(`Content valid: ${count} Markdown entries, ${images} local images; YAML schemas, all metadata (including unpublished), unique orders, HTTPS fields and secure image paths checked.`);
console.log('Remote URL availability is not checked.');

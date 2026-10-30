import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { contentSchemas, siteSchema, navigationSchema, skillsSchema, sectionContentIds } from '../src/config/schemas.mjs';
import { entries, markdown, root, yaml } from './helpers.mjs';

for (const [collection, schema] of Object.entries(contentSchemas)) {
  test(`${collection}: Markdown metadata satisfies the strict schema`, () => {
    const items = entries(collection);
    assert(items.length > 0);
    const orders = new Set();
    for (const { data, slug } of items) {
      assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      schema.parse(data);
      assert.equal(schema.safeParse({ ...data, unexpected: true }).success, false);
      for (const key of Object.keys(data)) {
        const omitted = { ...data };
        delete omitted[key];
        if (!schema.shape[key].isOptional()) assert.equal(schema.safeParse(omitted).success, false, `${collection}.${key} is required`);
      }
      if ('order' in data) {
        assert(!orders.has(data.order), `${collection}: duplicate order`);
        orders.add(data.order);
        for (const value of [0, -1, 1.5, '1']) assert.equal(schema.safeParse({ ...data, order: value }).success, false);
        assert.equal(schema.safeParse({ ...data, published: 'true' }).success, false);
      }
    }
  });
}

test('YAML configuration is valid and rejects missing, duplicate and unknown metadata', () => {
  const site = yaml('src/config/site.yaml');
  const navigation = yaml('src/config/navigation.yaml');
  siteSchema.parse(site);
  navigationSchema.parse(navigation);
  skillsSchema.parse(yaml('src/content/skills.yaml'));
  for (const key of Object.keys(site)) {
    const copy = { ...site }; delete copy[key];
    assert.equal(siteSchema.safeParse(copy).success, false);
  }
  for (const key of Object.keys(site.labels)) {
    const labels = { ...site.labels }; delete labels[key];
    assert.equal(siteSchema.safeParse({ ...site, labels }).success, false);
  }
  assert.equal(siteSchema.safeParse({ ...site, unexpected: true }).success, false);
  for (const key of ['introductions', 'contact']) assert.equal(siteSchema.safeParse({ ...site, [key]: {} }).success, false, `site must reject legacy ${key}`);
  assert.equal(navigationSchema.safeParse([...navigation, navigation[0]]).success, false);
  assert.equal(navigationSchema.safeParse(navigation.map(() => navigation[0])).success, false);
  assert.equal(navigationSchema.safeParse(navigation.slice(1)).success, false);
  assert.equal(navigationSchema.safeParse([{ ...navigation[0], id: 'unknown' }, ...navigation.slice(1)]).success, false);
  for (const invalid of [[], [''], ['   '], [1]]) assert.equal(skillsSchema.safeParse(invalid).success, false);
});

test('frontmatter rejects absent delimiters, malformed YAML and duplicate keys', () => {
  for (const source of ['title: Missing delimiters', '---\ntitle: [broken\n---\n', '---\ntitle: One\ntitle: Two\n---\n']) assert.throws(() => markdown(source));
});

test('image paths and HTTPS fields reject unsafe or legacy values', () => {
  const project = entries('projects')[0].data;
  for (const field of ['cover', 'caseStudy']) {
    for (const value of ['https://example.com/image.png', '//example.com/image.png', '/images/../secret.png', '/images/%2e%2e/secret.png', '/images/a.png?x=1', '/images/a.png#x', '/images/a\\b.png', '/elsewhere/a.png', '/images/a.html', '']) {
      assert.equal(contentSchemas.projects.safeParse({ ...project, [field]: value }).success, false, `${field}: ${value}`);
    }
  }
  for (const value of ['http://example.com', 'javascript:alert(1)', '//example.com', '/relative', 'https://user:pass@example.com', 'https://example.com/a b', 'not a URL']) {
    assert.equal(contentSchemas.projects.safeParse({ ...project, prototype: value }).success, false, value);
    const profile = entries('profile')[0].data;
    assert.equal(contentSchemas.profile.safeParse({ ...profile, socials: [{ platform: 'Example', url: value }] }).success, false);
    assert.equal(contentSchemas.certificates.safeParse({ ...entries('certificates')[0].data, url: value }).success, false);
  }
  for (const field of ['imageUrl', 'demoUrl', 'repoUrl', 'description']) assert.equal(contentSchemas.projects.safeParse({ ...project, [field]: 'legacy' }).success, false);
});

function validateFixture(mutate) {
  const fixture = mkdtempSync(join(root, 'tests/.validation-'));
  try {
    for (const path of ['scripts', 'src/config', 'src/content']) cpSync(join(root, path), join(fixture, path), { recursive: true });
    symlinkSync(join(root, 'node_modules'), join(fixture, 'node_modules'), 'dir');
    cpSync(join(root, 'public'), join(fixture, 'public'), { recursive: true });
    writeFileSync(join(fixture, 'package.json'), '{"type":"module"}');
    mutate?.(fixture);
    const result = spawnSync(process.execPath, ['scripts/validate.mjs'], { cwd: fixture, encoding: 'utf8', timeout: 30000 });
    assert.ifError(result.error);
    return result;
  } finally { rmSync(fixture, { recursive: true, force: true }); }
}

test('section content contains exactly the expected homepage entries', () => {
  assert.deepEqual([...sectionContentIds].sort(), ['contact', 'education', 'experience', 'projects', 'skills']);
  assert.deepEqual(entries('sections').map(entry => entry.slug).sort(), [...sectionContentIds].sort());
});

test('repository validator rejects missing, unknown and empty section content', () => {
  const missing = validateFixture(directory => rmSync(join(directory, 'src/content/sections', `${sectionContentIds[0]}.md`)));
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /sections: expected exactly one Markdown file for each homepage section/);
  const unknown = validateFixture(directory => writeFileSync(join(directory, 'src/content/sections/unknown.md'), '---\ntitle: Unknown\n---\nUnexpected section.\n'));
  assert.notEqual(unknown.status, 0);
  assert.match(unknown.stderr, /sections: expected exactly one Markdown file for each homepage section/);
  const empty = validateFixture(directory => writeFileSync(join(directory, 'src/content/sections', `${sectionContentIds[0]}.md`), '---\ntitle: Empty\n---\n \n\t\n'));
  assert.notEqual(empty.status, 0);
  assert.match(empty.stderr, /sections\/.*: Markdown body must not be empty/);
});

test('repository validator accepts content and rejects duplicate orders and missing images', () => {
  const valid = validateFixture();
  assert.equal(valid.status, 0, valid.stderr);
  const duplicate = validateFixture(directory => cpSync(join(directory, 'src/content/projects', `${entries('projects')[0].slug}.md`), join(directory, 'src/content/projects/duplicate-fixture.md')));
  assert.notEqual(duplicate.status, 0);
  assert.match(duplicate.stderr, /duplicate order/i);
  const missing = validateFixture(directory => {
    const project = entries('projects')[0];
    const source = `---\n${Object.entries({ ...project.data, cover: '/images/nonexistent-test-fixture.png' }).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n')}\n---\n${project.body}`;
    writeFileSync(join(directory, 'src/content/projects', `${project.slug}.md`), source);
  });
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /ENOENT|image must be a file/);
  const pointer = validateFixture(directory => {
    const image = entries('projects')[0].data.cover;
    writeFileSync(join(directory, 'public', image.slice(1)), 'version https://git-lfs.github.com/spec/v1\noid sha256:' + '0'.repeat(64) + '\nsize 1\n');
  });
  assert.notEqual(pointer.status, 0);
  assert.match(pointer.stderr, /unresolved Git LFS pointer/);
});

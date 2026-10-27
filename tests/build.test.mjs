import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';
import { decode, entries, root, tags, walk, yaml } from './helpers.mjs';

const dist = join(root, 'dist');

test('homepage collections render highest order first', () => {
  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  const navigation = yaml('src/config/navigation.yaml');
  for (const [collection, section, field] of [
    ['projects', 'projects', 'title'],
    ['experience', 'experience', 'role'],
    ['education', 'education', 'degree'],
    ['certificates', 'education', 'name'],
  ]) {
    if (!navigation.find(item => item.id === section)?.visible) continue;
    const match = new RegExp(String.raw`<section\b[^>]*\bid="${section}"[^>]*>([\s\S]*?)<\/section>`).exec(html);
    assert(match, `Missing section ${section}`);
    const text = decode(match[1].replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
    const items = entries(collection).filter(entry => entry.data.published).sort((a, b) => b.data.order - a.data.order);
    let cursor = 0;
    for (const item of items) {
      const title = item.data[field].replace(/\s+/g, ' ');
      const index = text.indexOf(title, cursor);
      assert(index >= cursor, `${collection}: ${item.slug} must appear in descending order`);
      cursor = index + title.length;
    }
  }
});

test('project cards use summaries while detail pages keep the written case studies', () => {
  const home = decode(readFileSync(join(dist, 'index.html'), 'utf8').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
  for (const project of entries('projects').filter(entry => entry.data.published)) {
    assert(home.includes(project.data.summary.replace(/\s+/g, ' ')), `${project.slug}: missing card summary`);
    const detail = readFileSync(join(dist, 'projects', project.slug, 'index.html'), 'utf8');
    if (project.data.repository) assert(tags(detail).some(tag => tag.name === 'a' && tag.attrs.href === project.data.repository));
        if (project.data.coverAlt) {
          for (const html of [readFileSync(join(dist, 'index.html'), 'utf8'), detail]) {
            assert(tags(html).some(tag => tag.name === 'img' && tag.attrs.alt === project.data.coverAlt), `${project.slug}: missing descriptive cover alt text`);
          }
        }
        if (project.data.coverCaption) {
          assert(tags(detail).some(tag => tag.name === 'figcaption'));
          assert(decode(detail.replace(/<[^>]*>/g, ' ')).includes(project.data.coverCaption));
        }
    const heading = /^## (.+)$/m.exec(project.body)?.[1];
    if (heading) {
      assert(decode(detail.replace(/<[^>]*>/g, ' ')).includes(heading));
      assert(!home.includes(heading), `${project.slug}: full case study leaked into homepage`);
    }
  }
});

test('homepage includes editable section introductions and an expanded contact invitation', () => {
  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  const text = decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
  const navigation = yaml('src/config/navigation.yaml');
  const plainText = source => decode(source.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
  for (const entry of entries('sections')) {
    if (!navigation.find(item => item.id === entry.slug)?.visible) continue;
    const section = new RegExp(String.raw`<section\b[^>]*\bid="${entry.slug}"[^>]*>([\s\S]*?)<\/section>`).exec(html);
    assert(section, `Missing section ${entry.slug}`);
    const heading = /<h2\b[^>]*>([\s\S]*?)<\/h2>/.exec(section[1]);
    assert(heading, `${entry.slug}: missing main h2`);
    const title = heading[1].replace(/<span\b[^>]*\baria-hidden=["']true["'][^>]*>[\s\S]*?<\/span>/gi, '');
    assert.equal(plainText(title), entry.data.title.replace(/\s+/g, ' ').trim(), `${entry.slug}: incorrect section title`);
    const normalizeQuotes = source => source.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
    const sectionText = normalizeQuotes(plainText(section[1]));
    for (const block of entry.body.trim().split(/\r?\n\s*\r?\n/)) {
      const copy = block.replace(/^###\s+/gm, '').replace(/\s+/g, ' ').trim();
      assert(sectionText.includes(normalizeQuotes(copy)), `${entry.slug}: missing paragraph or heading: ${copy}`);
    }
  }
  assert(!/\b0[1-9]\s*\//.test(text), 'Sections must not display numerical prefixes');
  assert(!/\bProject\s+0[1-9]\b/.test(text), 'Projects must not display numerical prefixes');
});

test('all pages keep a native top link and a progressively enhanced floating shortcut', () => {
  for (const file of walk(dist).filter(file => extname(file) === '.html')) {
    const elements = tags(readFileSync(file, 'utf8'));
    assert(elements.some(tag => tag.attrs.id === 'top' && tag.attrs.tabindex === '-1'));
    const floating = elements.find(tag => tag.name === 'a' && 'data-back-to-top' in tag.attrs);
    assert(floating);
    assert.equal(floating.attrs.href, '#top');
    assert('hidden' in floating.attrs, 'Floating link must start hidden without JavaScript');
    assert(elements.some(tag => tag.name === 'a' && tag.attrs.href === '#top' && !('data-back-to-top' in tag.attrs)), 'Keep a non-JavaScript footer link');
  }
});

test('all pages declare system-aware browser theme colors', () => {
  for (const file of walk(dist).filter(file => extname(file) === '.html')) {
    const elements = tags(readFileSync(file, 'utf8'));
    assert(elements.some(tag => tag.name === 'meta' && tag.attrs.name === 'color-scheme' && tag.attrs.content === 'light dark'));
    for (const theme of ['light', 'dark']) assert(elements.some(tag => tag.name === 'meta' && tag.attrs.name === 'theme-color' && tag.attrs.media === `(prefers-color-scheme: ${theme})`));
  }
});

test('built site has complete local links, assets, anchors and published project routes', () => {
  assert(existsSync(join(dist, 'index.html')), 'Build first: npm run build (dist/index.html is required)');
  const files = walk(dist);
  const pages = new Map(files.filter(file => extname(file) === '.html').map(file => [file, tags(readFileSync(file, 'utf8'))]));
  const home = pages.get(join(dist, 'index.html'));
  const canonical = home.find(tag => tag.name === 'link' && tag.attrs.rel === 'canonical')?.attrs.href;
  assert(canonical, 'Homepage must declare a canonical URL');
  const site = new URL(canonical);
  assert.match(site.protocol, /^https?:$/);
  const base = site.pathname.replace(/\/?$/, '/');
  const urlFor = file => new URL(relative(dist, file).split(sep).join('/').replace(/index\.html$/, ''), site);
  const ids = file => new Set((pages.get(file) ?? []).flatMap(tag => tag.attrs.id === undefined ? [] : [tag.attrs.id]));

  function target(value, from, { image = false, anchor = false } = {}) {
    const url = new URL(value, urlFor(from));
    if (image) assert.equal(url.origin, site.origin, `${relative(dist, from)}: remote image ${value}`);
    if (!['http:', 'https:'].includes(url.protocol)) {
      assert(!image, `Image must be a local file: ${value}`);
      return;
    }
    if (url.origin !== site.origin) return; // Outgoing links are deliberately never fetched.
    const pathname = decodeURIComponent(url.pathname);
    assert(pathname === base.slice(0, -1) || pathname.startsWith(base), `${value}: internal URL escapes canonical base ${base}`);
    const local = pathname === base.slice(0, -1) ? '' : pathname.slice(base.length);
    let file = resolve(dist, local);
    assert(file === dist || file.startsWith(dist + sep), `Unsafe target: ${value}`);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    assert(existsSync(file) && statSync(file).isFile(), `${relative(dist, from)}: missing target ${value}`);
    assert(realpathSync(file).startsWith(realpathSync(dist) + sep), `Target escapes dist: ${value}`);
    if (anchor && url.hash && extname(file) === '.html') assert(ids(file).has(decodeURIComponent(url.hash.slice(1))), `${relative(dist, from)}: missing anchor ${value}`);
    return file;
  }

  for (const [file, elements] of pages) {
    const seen = new Set();
    for (const { name, attrs } of elements) {
      if (attrs.id !== undefined) {
        assert(!seen.has(attrs.id), `${relative(dist, file)}: duplicate ID ${attrs.id}`);
        seen.add(attrs.id);
      }
      if (attrs.href !== undefined && ['a', 'link'].includes(name)) target(attrs.href, file, { anchor: name === 'a' });
      if (attrs.src !== undefined) target(attrs.src, file, { image: name === 'img' || name === 'source' });
      if (name === 'img') assert(attrs.src || attrs.srcset, `${relative(dist, file)}: image has no source`);
      if (attrs.srcset) for (const candidate of attrs.srcset.split(',')) target(candidate.trim().split(/\s+/)[0], file, { image: true });
      if (attrs.poster) target(attrs.poster, file, { image: true });
      if (attrs.style) for (const match of attrs.style.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) target(match[1], file);
    }
  }
  for (const file of files) {
    assert(!readFileSync(file).subarray(0, 128).toString('utf8').startsWith('version https://git-lfs.github.com/spec/v1'), `Unresolved Git LFS pointer in output: ${relative(dist, file)}`);
    assert.notEqual(extname(file), '.json', `Unexpected JSON output: ${relative(dist, file)}`);
    if (extname(file) === '.css') {
      const css = readFileSync(file, 'utf8');
      for (const match of css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) target(match[1], file);
      for (const match of css.matchAll(/@import\s+["']([^"']+)["']/g)) target(match[1], file);
    }
    if (extname(file) === '.js' || extname(file) === '.mjs') {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["']((?:\.\.?\/|\/)[^"']+)["']/g)) target(match[1], file);
    }
  }

  for (const section of yaml('src/config/navigation.yaml')) {
    assert.equal(ids(join(dist, 'index.html')).has(section.id), section.visible, `Section visibility: ${section.id}`);
  }
  const links = home.filter(tag => tag.name === 'a').map(tag => new URL(tag.attrs.href ?? '', site).pathname);
  for (const project of entries('projects')) {
    const route = join(dist, 'projects', project.slug, 'index.html');
    assert.equal(existsSync(route), project.data.published, `${project.slug}: route must match published metadata`);
    if (!project.data.published) {
      assert(!links.some(path => path.replace(/\/$/, '') === `${base}projects/${project.slug}`), `${project.slug}: draft linked from home`);
      continue;
    }
    assert(links.some(path => path.replace(/\/$/, '') === `${base}projects/${project.slug}`), `${project.slug}: homepage must link to project detail`);
    const elements = pages.get(route);
    assert(elements, `${project.slug}: route is not an HTML page`);
    if (project.data.caseStudy) {
      const images = elements.filter(tag => tag.name === 'img' && (tag.attrs.class ?? '').split(/\s+/).includes('case-study-image'));
      assert(images.length > 0, `${project.slug}: missing case-study-image`);
      assert(images.some(tag => new URL(tag.attrs.src, site).pathname === `${base}${project.data.caseStudy.slice(1)}`), `${project.slug}: case study must use metadata image`);
      assert(elements.some(tag => tag.name === 'dialog' && (tag.attrs.class ?? '').split(/\s+/).includes('image-viewer')), `${project.slug}: missing image-viewer dialog`);
    }
  }
});

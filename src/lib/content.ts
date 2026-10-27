import { getCollection, getEntry, render, type CollectionEntry } from 'astro:content';
import { parse } from 'yaml';
import siteYaml from '../config/site.yaml?raw';
import navigationYaml from '../config/navigation.yaml?raw';
import skillsYaml from '../content/skills.yaml?raw';
import { siteSchema, navigationSchema, skillsSchema, sectionContentIds } from '../config/schemas.mjs';

type OrderedCollection = 'projects' | 'experience' | 'education' | 'certificates';

type RenderedEntry<K extends OrderedCollection> = CollectionEntry<K>['data'] & {
  id: string;
  Content: Awaited<ReturnType<typeof render>>['Content'];
};

async function ordered<K extends OrderedCollection>(collection: K): Promise<RenderedEntry<K>[]> {
  const entries = await getCollection(collection);
  const orders = new Set<number>();
  for (const entry of entries) {
    if (orders.has(entry.data.order)) throw new Error(`${collection}: duplicate order ${entry.data.order}`);
    orders.add(entry.data.order);
  }
  return Promise.all(entries
    .filter(entry => entry.data.published)
    .sort((a, b) => b.data.order - a.data.order || a.id.localeCompare(b.id))
    .map(async (entry: CollectionEntry<K>) => ({
          id: entry.id,
          ...entry.data,
          Content: (await render(entry)).Content,
        } as RenderedEntry<K>)));
}

async function getSectionContent() {
  const entries = await getCollection('sections');
  if (entries.length !== sectionContentIds.length || sectionContentIds.some(id => !entries.some(entry => entry.id === id))) {
    throw new Error(`sections: expected exactly ${sectionContentIds.join(', ')}`);
  }
  return Object.fromEntries(await Promise.all(entries.map(async entry => [
    entry.id,
    { ...entry.data, Content: (await render(entry)).Content },
  ] as const)));
}

export async function getPortfolio() {
  const profile = await getEntry('profile', 'about');
  if (!profile) throw new Error('Missing profile/about.md');
  const [projects, experience, education, certificates, sectionContent] = await Promise.all([
    ordered('projects'), ordered('experience'), ordered('education'), ordered('certificates'), getSectionContent(),
  ]);
  return {
    profile: { ...profile.data, Content: (await render(profile)).Content },
    skills: skillsSchema.parse(parse(skillsYaml)),
    projects, experience, education, certificates, sectionContent,
    site: siteSchema.parse(parse(siteYaml)),
    navigation: navigationSchema.parse(parse(navigationYaml)),
  };
}

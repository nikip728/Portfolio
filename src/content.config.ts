import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { contentSchemas } from './config/schemas.mjs';

export const collections = {
  profile: defineCollection({ loader: glob({ pattern: 'about.md', base: './src/content/profile' }), schema: contentSchemas.profile }),
  projects: defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/projects' }), schema: contentSchemas.projects }),
  experience: defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/experience' }), schema: contentSchemas.experience }),
  education: defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/education' }), schema: contentSchemas.education }),
  certificates: defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/certificates' }), schema: contentSchemas.certificates }),
};

import { z } from 'astro/zod';

const text = z.string().trim().min(1);
const https = text.refine(value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password && !/\s/.test(value);
  } catch { return false; }
}, 'Expected an HTTPS URL without credentials');
const image = text.regex(/^\/images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp|gif|svg|avif)$/);
const ordered = { order: z.number().int().positive(), published: z.boolean() };
export const contentSchemas = {
  profile: z.object({ name: text, title: text, email: z.string().email(), avatar: image.optional(), socials: z.array(z.object({ platform: text, url: https }).strict()) }).strict(),
  projects: z.object({ title: text, ...ordered, tags: z.array(text), cover: image, prototype: https.optional(), caseStudy: image.optional() }).strict(),
  experience: z.object({ role: text, company: text, period: text, ...ordered }).strict(),
  education: z.object({ degree: text, institution: text, year: text, ...ordered }).strict(),
  certificates: z.object({ name: text, issuer: text, date: text, ...ordered, url: https.optional() }).strict(),
};
const labelKeys = ['skipToContent', 'home', 'mainNavigation', 'mobileNavigation', 'menu', 'exploreWork', 'getInTouch', 'projectPrefix', 'projectTags', 'prototype', 'caseStudy', 'certificatesHeading', 'viewCertificate', 'backToTop', 'imageAltSuffix', 'caseStudyIntro', 'backToProjects', 'openImage', 'caseStudyImageAlt', 'projectOverview', 'enlargeImage', 'actualSize', 'closeViewer', 'imageRegion', 'viewerHint'];
export const siteSchema = z.object({ language: text.regex(/^[a-zA-Z]{2,8}(?:-[a-zA-Z0-9]{1,8})*$/), description: text, labels: z.object(Object.fromEntries(labelKeys.map(key => [key, text]))).strict() }).strict();
const sections = ['about', 'skills', 'projects', 'experience', 'education', 'contact'];
export const navigationSchema = z.array(z.object({ id: z.enum(sections), label: text, visible: z.boolean() }).strict()).refine(items => items.length === sections.length && new Set(items.map(item => item.id)).size === sections.length, 'Include each navigation section exactly once');
export const skillsSchema = z.array(text).min(1);

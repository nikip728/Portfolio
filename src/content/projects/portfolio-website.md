---
title: Portfolio Website — From Content to Interface
summary: A design-led website built with Astro, Markdown, and CSS. A place to explore how typography, content structure, and small interactions come together in code.
order: 4
published: true
tags:
  - Astro
  - TypeScript
  - CSS
  - Front-end
cover: /images/projects/portfolio-website/Portfolio.website-main.png
coverAlt: An illustrated desktop browser and mobile phone showing the Papp Niki portfolio's typography and project layouts.
coverCaption: An interface illustration inspired by the portfolio's first visual language, not a browser screenshot.
repository: https://github.com/nikip728/Portfolio
details:
  role: Design and front-end development
  workedWith: "I worked alongside my mentor"
  scope: Portfolio design, content structure, and website implementation
  platform: Responsive website
---
## A home for the work

The goal of this project was to bring my UI/UX design and front-end development work together in one polished, easy-to-navigate portfolio. I wanted to create a personal space where visitors could explore my projects, understand the thinking behind each one, and learn more about my skills and background.

The portfolio is designed to present both sides of my interests: visual design and front-end development. Rather than focusing on advanced engineering, the project gave me an opportunity to explore how these two areas can come together in a single, cohesive experience.

## Design choices

I chose a minimal and welcoming visual direction, using a warm cream background, soft pink accents, and consistent typography throughout the site. The overall appearance is intended to feel pleasant and approachable without distracting from the projects themselves. Both light and dark themes follow the same visual identity while offering different viewing preferences.

The homepage introduces me and my work, followed by dedicated pages for each project. Each project page includes its case study and prototype, while the lower sections present my skills, certificates, education, and contact information. A menu in the top-right corner provides access to the different sections without taking attention away from the main content.

The portfolio's visual presentation has also evolved over time. During a later update, I refreshed the original cover image for aesthetic reasons, bringing it more in line with the overall visual direction.

## Under the hood

The site uses Astro to generate static HTML pages. There is no database or admin backend: project descriptions live in Markdown, while YAML holds navigation, interface copy, and grouped skills. This keeps most content changes separate from the page templates.

![A screenshot from the VScode.](/images/projects/portfolio-website/Portfolio.website-VScode.png)

Shared schemas validate the metadata, including publication flags, ordering, local image paths, and HTTPS links. Project pages are generated from the published collection, so adding a project does not require creating a new page template.

TypeScript supports the page interactions, and CSS handles the responsive layouts and colour themes. Small browser-native enhancements add entry animations, a floating back-to-top link, and a dialog for enlarging visual case studies, without an animation framework.

## Details that support reading

The portfolio includes keyboard focus styles and a skip link to support navigation. Content remains visible without JavaScript, and case-study images can still be opened as original files if the dialog is unavailable.

The site also respects the reduced-motion preference, and focusing a block cancels its entry animation. These are deliberate implementation choices, not a claim that the site has passed a full accessibility audit.

## Checks and publishing

The project is maintained through GitHub, which I also use to manage and test updates to the site. The repository serves as the reference for the current implementation and provides the workflow for keeping the published portfolio up to date.

The site is intended to remain easy to maintain as I add new work, without requiring changes to the underlying page structure for every new project.

## Where I would take it next

My main next step is to expand the portfolio with additional projects as I continue developing my UI/UX and front-end skills. I also want to keep refining the presentation so that new work fits naturally into the existing structure and visual identity.

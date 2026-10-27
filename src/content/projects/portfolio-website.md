---
title: Portfolio Website — From Content to Interface
summary: A design-led website built with Astro, Markdown, and CSS. A place to explore how typography, content structure, and small interactions come together in code.
order: 1
published: true
tags:
  - Astro
  - TypeScript
  - CSS
  - Front-end
cover: /images/projects/portfolio-website/cover.svg
coverAlt: An illustrated desktop browser and mobile phone showing the Papp Niki portfolio's typography and project layouts.
coverCaption: An interface illustration inspired by the portfolio's visual language, not a browser screenshot.
repository: https://github.com/nikip728/Portfolio
---
## A home for the work

The brief is simple: give my design projects a clear, personal home that is easy to browse and maintain. The work should lead, with enough context to explain the thinking behind it and a straightforward way to get in touch.

This project also connects my main interest in UI/UX with my curiosity about front-end development. It is a practical setting for exploring how a visual idea becomes a working interface, rather than a showcase of advanced engineering.

## Design choices

- **An editorial visual language.** Serif headings, a warm paper background, and a restrained accent colour give the portfolio its character without competing with the project imagery.
- **Two levels of detail.** Short summaries help visitors scan the homepage; dedicated project pages leave room for decisions, tradeoffs, and reflection.
- **Layouts that adapt.** Project cards sit side by side on larger screens and stack on mobile. Navigation switches to a compact menu when space is limited.
- **Light and dark palettes.** The interface follows the reader's system preference, while project images keep their original colours.

## Under the hood

The site uses **Astro** to generate static HTML pages. There is no database or admin backend: project descriptions live in **Markdown**, while **YAML** holds navigation, interface copy, and grouped skills. This keeps most content changes separate from the page templates.

Shared schemas validate the metadata, including publication flags, ordering, local image paths, and HTTPS links. Project pages are generated from the published collection, so adding a project does not require creating a new page template.

**TypeScript** supports the page interactions, and **CSS** handles the responsive layouts and colour themes. Small browser-native enhancements add entry animations, a floating back-to-top link, and a dialog for enlarging visual case studies, without an animation framework.

## Details that support reading

Keyboard focus styles, a skip link, and a footer link to the top support navigation. Content remains visible without JavaScript, and the case-study image link can open the original file if the dialog is unavailable.

Motion is optional: the site respects the reduced-motion preference, and focusing a block cancels its entry animation. These are deliberate implementation choices, not a claim that the site has passed a full accessibility audit.

## Checks and publishing

The build validates the content and runs Astro and TypeScript checks before generating the website. Automated tests check metadata, local links and assets, publication visibility, and interaction behaviour.

GitHub Actions runs checks on pull requests and pushes to the main branch. Publishing to GitHub Pages is a separate, manually triggered workflow, so passing a check does not automatically make an editorial draft live.

The repository linked above is the reference for the current implementation. This overview describes the site's structure and learning goals; it is not a claim that every implementation detail was completed independently.

## Where I would take it next

I'd like to review the page hierarchy and navigation with readers outside the project, capture real desktop and mobile screenshots, and carry out a more systematic keyboard and screen-reader review. Another useful exercise would be to measure image loading and page performance before deciding what needs optimisation, rather than assuming that a static site is automatically fast.

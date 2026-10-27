# Papp Niki — Portfolio

A static Astro portfolio with Markdown content, YAML configuration, and local project images. No database or admin backend is required.

## Development

Requires Node.js **22.23.4 or later**. The workflows use Node 24 with `check-latest: true`, avoiding older preinstalled Node 22 patches that do not satisfy Astro's minimum version.

```sh
npm ci
npm run dev
```

The default base path is `/Portfolio`; open that path on the development server. To validate and inspect a production build locally:

```sh
npm run build
npm test
npm run preview
```

`npm run build` validates content and runs Astro/TypeScript checks before building. `npm run validate` runs content validation separately and regenerates editor schemas. Production output goes to `dist/`. Neither `dist/` nor `.astro/` is committed: both are Git-ignored. The deployment workflow uploads the built site as a Pages artifact, not as a Git commit. Generated editor schemas under `src/config/editor-schemas/` are tracked tooling files, not the generated website. `npm test` checks metadata validation, generated pages, local links and images, publication visibility, and workflow safety; run it after building.

## Editing content

Astro content collections are defined in `src/content.config.ts`, with metadata schemas in `src/config/schemas.mjs`.

| File or directory | What to edit |
| --- | --- |
| `src/content/profile/about.md` | Profile metadata and introductory prose |
| `src/content/projects/*.md` | Project metadata and project descriptions |
| `src/content/experience/*.md` | Role metadata and experience descriptions |
| `src/content/education/*.md` | Education metadata and descriptions |
| `src/content/certificates/*.md` | Certificate metadata and descriptions |
| `src/content/skills.yaml` | Ordered list of skills |
| `src/config/site.yaml` | Language, SEO description, and interface labels |
| `src/config/navigation.yaml` | Section labels, order, and visibility |

Markdown files start with YAML metadata between `---` delimiters; the main prose belongs below the closing delimiter. Projects, experience, education, and certificates use a positive integer `order` and a boolean `published`. The profile has its own metadata schema, without those two fields.

Ordered collections display the **highest `order` first**. To add a new first item, use the collection's current maximum plus one; existing files do not need renumbering. Values must be unique within each collection, but do not have to be consecutive (10, 20, 30 is valid). Navigation and skills keep their explicit YAML list order. Existing content numbers were migrated once to preserve the previous visible order.

For example, a new project can start as an unpublished draft:

```markdown
---
title: New Project
order: 4
published: false
tags:
  - UI/UX
cover: /images/projects/new-project/cover.png
---
Describe the problem, your contribution, and the outcome here.
```

Create the referenced image before validating. Use a unique filename such as `new-project.md`; keep the filename stable because it identifies the project. Optional project fields include an HTTPS `prototype` URL and a local `caseStudy` image path. Omit optional fields rather than adding empty links. Set `published: true` when ready, then build, test, and review the result before deployment.

Preserve each content type's required metadata when editing existing files. In YAML, use spaces rather than tabs, keep booleans unquoted, and quote text containing a colon followed by a space. In `navigation.yaml`, keep every section ID exactly once; reorder entries or change `visible` rather than deleting sections.

### Local images

Project images live under `public/images/projects/`:

- `budgeting-app/cover.png` and `budgeting-app/case-study.png`
- `pinterest-redesign/cover.png` and `pinterest-redesign/case-study.png`
- `surfboard-store/cover.png`

Reference them directly as `/images/projects/budgeting-app/cover.png`, for example. Image paths point directly to local files. Do not add `/public` or `/Portfolio` to content image paths; the application handles the deployment base path.

### Project pages and case studies

Each published project has a page at `/projects/<filename-without-extension>/`. Its title, tags, prototype link, Markdown body, and optional case-study image come from the project's Markdown file. Links on the homepage lead to these pages, rather than opening a bare image.

Case-study images render at full width without cropping. **Enlarge case study** opens a keyboard-accessible dialog; **Actual size** toggles the original image dimensions, with scrolling for long or wide images. Close with the **Close** button or Escape; focus returns to the opening link. Without JavaScript, that link opens the local image directly. No third-party viewer service is used.

The existing image-based case studies are not searchable or screen-reader-readable as prose. For better accessibility, add a written case study to the Markdown body; image zoom improves visual reading but does not replace a text alternative.

### Validation and editor support

Required metadata, unique positive ordering, publication flags, HTTPS links, and local image paths are validated. Non-certificate Markdown entries require a nonempty body. Unpublished content is validated too. Configuration YAML includes editor-schema references; `src/config/editor-schemas/*.json` contains generated tooling schemas, not editable portfolio content. Edit the shared schemas in `src/config/schemas.mjs` and run validation to regenerate them.

### Historical content

Original exports remain in the private, Git-ignored `archive/` directory, not in the active content tree or build output. An unavailable certificate collection link was omitted from active content; the certificate's name, issuer, and date remain, and its original link is preserved in the private export. Add a local certificate document or a replacement URL when available. Editable prototype source files and external certificate documents still require separate owner exports.

## Automatic light and dark themes

The site follows the reader's system/browser color preference through CSS `prefers-color-scheme`. It starts in the matching theme, responds to preference changes while open, and requires no JavaScript or saved setting. Without a dark preference, the light palette is used. Theme colors live in `src/styles/global.css`; browser theme-color metadata is defined in `src/layouts/Page.astro`. Images retain their original colors.

## Image storage

All files under `public/images/` are tracked through **Git LFS**, as configured in the root `.gitattributes`. This covers existing and future project images, regardless of image format. Small icons and the social card outside that directory remain ordinary Git files. Keep the attributes file versioned so every contributor uses the same rules.

Install the Git LFS client on each development machine. After cloning the repository, initialize it locally and download image objects:

```sh
git lfs install --local
git lfs pull
```

Then add images under `public/images/` and use the usual Git add, commit, and push process. Git stores small pointers in commits and uploads the binary objects through the LFS pre-push hook. Working files remain normal images. Do not bypass the hook or replace images with pointer text manually. No history rewriting or automatic commit is part of this setup.

Both workflows use `actions/checkout` with `lfs: true` to download image binaries **before** building. The site is built with Actions and deployed from the resulting artifact, rather than served directly from a source branch containing LFS pointers. Only actual static files from `dist/` are published. Validation rejects referenced images that are unresolved LFS pointers; build tests also reject pointers anywhere in the published output.

There is no repository-wide GitHub switch to enable tracking: it is controlled by the local client and committed `.gitattributes`. GitHub hosts the objects after push. Monitor the repository owner's LFS storage, download allowance, and spending budget in GitHub billing settings. CI downloads count against the owner's LFS bandwidth, and each new binary revision consumes storage. See [configuration](https://docs.github.com/en/repositories/working-with-files/managing-large-files/configuring-git-large-file-storage) and [billing](https://docs.github.com/en/billing/concepts/product-billing/git-lfs). Image compression remains worthwhile even with LFS.

## Checks and deployment

These workflows build on GitHub-hosted runners, not on your computer or on the live Pages site. GitHub Pages serves the resulting static files; it does not build the application at request time. All jobs pin `ubuntu-24.04` to avoid implicit operating-system migrations. Both the action runtime and the application build use Node 24. The build explicitly resolves the latest patch on that line.

### Automatic checks

`.github/workflows/check.yml` runs for pull requests and pushes to `main`. It installs locked dependencies with `npm ci`, runs `npm run build`, and then runs `npm test`. It has read-only repository permissions and never deploys.

After successful checks, a `review-dist` artifact containing only `dist/` is available from the Actions run for seven days. This is a downloadable build, **not a hosted public preview**. For a browser review, use `npm run preview` locally after building the same revision. New checks can cancel older checks for the same ref.

### Manual deployment

`.github/workflows/deploy.yml` runs **only** through **Actions → Deploy Astro to GitHub Pages → Run workflow**. Select **main**; other selected refs are skipped. A push or merge does not publish the site.

The workflow installs dependencies, obtains the Pages base path, builds, tests, and uploads only `dist/`. Only the deployment job receives Pages write and identity-token permissions. It references the standard `github-pages` environment. Manual workflow dispatch is the intended publication gate; no additional reviewer approval is required by this project's setup. Deployment concurrency uses `cancel-in-progress: false`, so a new run does not cancel an active deployment.

A failed install, validation, build, or test prevents artifact upload and deployment. A failed build leaves the currently published site unchanged. Automated checks cannot guarantee that text, layout, or design is correct: a visually or semantically wrong change can still pass and be published after manual trigger. Review the result before starting deployment.

### Required GitHub settings

Configure these in the target repository, `nikip728/Portfolio`:

1. A repository owner or administrator must first enable Pages under **Settings → Pages → Build and deployment → Source: GitHub Actions**. Merely adding the workflow does not enable the Pages site. For private repositories, the owner's plan must support private-repository Pages (GitHub Pro, Team, or Enterprise); GitHub Free supports Pages from public repositories. Do not change repository visibility without reviewing its contents and history.
2. **Settings → Environments → github-pages:** leave **Required reviewers** unset for manual-dispatch-only publishing. If reviewers were previously configured, remove that protection rule to avoid an additional approval step. Optionally restrict deployment branches to `main` as well; the workflow already checks the selected ref.
3. Optionally protect `main` with a branch protection rule or ruleset requiring pull requests and the **Build and test** check before merging. Select the check after it has run at least once.

Remote repository and environment settings are not modified by editing these files. Existing protection rules, if any, still apply until changed in GitHub.

The default site URL is `https://nikip728.github.io/Portfolio/`. For a different host or base path, override the build environment:

```sh
BASE_PATH=/ SITE_URL=https://example.com npm run build
```

### Troubleshooting first deployment

**Jekyll errors mentioning `.astro` files:** the repository is being published using **Deploy from a branch**, which starts GitHub's legacy Jekyll build against the source tree. Astro's `---` blocks contain JavaScript/TypeScript, not YAML; do not rewrite those files to satisfy Jekyll or install Ruby gems. An owner/admin must change **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The Pages API should report `build_type: workflow`, not `legacy`. Do not add a `.nojekyll` file to the source root as a substitute: the deployment must publish the Astro-generated `dist/` artifact, not application source files.

**Unsupported Node version:** both workflows use Node 24 with `check-latest: true`. A cached `22.23.3` does not meet Astro's `>=22.23.4` requirement. Run the updated workflow revision rather than retrying a run that still references the old Node configuration.

If **Configure Pages** fails with `HttpError: Not Found` / `Get Pages site failed`, check the repository's Pages settings before changing application code. An administrator can inspect `GET /repos/{owner}/{repo}/pages`; a missing Pages site returns 404, while the repository metadata's `has_pages` field indicates whether Pages exists. A collaborator without sufficient access can also receive 404, so check permissions as well.

Enable Pages with **GitHub Actions** as the source using an owner/admin account, and verify the owner's plan supports Pages for the repository visibility. This is a one-time administrative prerequisite. The workflow intentionally does not set `configure-pages`'s `enablement: true`: that action requires a separate privileged token to enable Pages, and a new broad-access secret is unnecessary for this setup.

After committing and pushing workflow changes to `main`, start a **new manual deployment run** from `main`. Re-running an old failed run uses its original workflow revision and will not pick up action-version fixes. The automatic check can succeed while deployment fails because checks do not access Pages configuration or publish anything.

### Safe publishing and rollback

1. Make content changes on a branch and open a pull request.
2. Wait for checks, inspect the content diff, and review a local production preview.
3. Merge to `main`; verify the checks for the merged revision.
4. Manually run deployment with `main` selected. Successful build and test jobs proceed to publication without an extra approval step unless remote environment rules require one.
5. If a published change is wrong, use Git revert to create a new commit undoing it on `main` through the normal pull-request process. Let checks pass, then manually deploy `main` again. Reverting alone does not republish the site.

## Scope

Active content is maintained in the Markdown and YAML files above, not in historical exports. Keep private archives and credentials out of published content. The deployment artifact contains only the generated `dist/` directory.

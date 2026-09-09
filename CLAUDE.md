# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Marketing site for **Nosto**, a two-building residential project in Timișoara (Romanian-language UI, `lang="ro"`). Astro 7 + Svelte 5 + Tailwind 4 frontend deployed on Vercel, with content in Sanity. The Sanity Studio lives in `studio-nosto/` as a separate npm project.

## Commands

Root (Astro site), Node 24 (`.nvmrc`):

```bash
npm run dev            # astro dev
npm run build          # astro build (fetches Sanity content at build time)
npm run preview
npm run format         # prettier --write .   (also formats studio-nosto/, which has its own Prettier style)
npm run format:check
```

Studio (`cd studio-nosto`):

```bash
npm run dev            # local Studio
npm run deploy         # deploys the Studio to nosto-official.sanity.studio; run after schema changes
```

There is no test suite and no lint at the root; Prettier is the only code-quality tool. The Studio has ESLint via `@sanity/eslint-config-studio`. `npx astro check` is not wired up and will prompt to install `@astrojs/check`.

### Environment

- `SANITY_STUDIO_PROJECT_ID` is the one variable both halves need. `astro.config.mjs` loads the root `.env` via `dotenv`; the Studio reads it from its own environment in `studio-nosto/`.
- `RESEND_API_KEY` is required by the contact-form API route (`src/pages/api/send-email.ts`).
- Nothing else is read from the environment. Contact details such as phone and WhatsApp are hard-coded in `src/config/contact.ts`.

## Sanity MCP safety

The project has a single dataset, `production`, so every Sanity write is a production write.

**Before any Sanity MCP call that changes state** (`create_documents`, `patch_documents`, `publish_documents`, `unpublish_documents`, `discard_drafts`, `create_version`, `version_discard`, `create_release`, `deploy_schema`, `deploy_studio`, `dataset_assets_upload`, dataset/project/CORS mutations, or `run_sanity_cli` with a mutating command), call `mcp__Sanity__whoami` first in the same session and confirm the authenticated account email is exactly `info@nosto.ro`. If it is any other account, or `whoami` fails, do not make the change. Report which account is authenticated and stop.

## Architecture

### Rendering model

Astro's default static output with the Vercel adapter. Every page is prerendered at build time, including all Sanity-driven pages, so **content edits in Sanity only appear after a new build/deploy**. The one server-rendered route is `src/pages/api/send-email.ts` (`prerender = false`), which relays the contact form to `info@nosto.ro` through Resend.

Sanity is accessed through the `@sanity/astro` integration: import `sanityClient` from the virtual module `sanity:client` (configured in `astro.config.mjs`, `useCdn: false`). Image URLs go through `src/utils/sanityImageUrl.ts`, which wraps `@sanity/image-url` and returns `null` for images without an asset reference.

### Content model (Sanity, `studio-nosto/schemaTypes/`)

| Type                                     | Used by                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| `unit` (Corp A) and `unitCorpB` (Corp B) | apartment listings and detail pages                                                        |
| `floor` (`name`, `level`)                | referenced by units; `name` must match the floor names hard-coded in the Svelte components |
| `newsPost`                               | `/noutati`                                                                                 |
| `faq`, `location`, `dotari`              | `FAQ.astro`, `/locatie`, `Dotari.astro`                                                    |

`unit` and `unitCorpB` are both produced by the `defineUnitType` factory in `unitBase.ts` so they cannot drift. The only difference: Corp B allows `price: 0` for units not yet on sale. Add fields to the factory, not to one type.

### Two buildings, mirrored code

Corp A and Corp B are parallel copies rather than one parameterized path:

- `/apartamente` → `Apartments.svelte` → `Parter`, `Etaj1`, `Etaj2`, `Etaj3` (queries `_type == "unit"`)
- `/apartamente-b` → `ApartmentsB2.svelte` → `ParterB2`, `Etaj1B2`, `Etaj2B2`, `Etaj3B2` (queries `_type == "unitCorpB"`)

`Apartments.svelte` and `ApartmentsB2.svelte` are near-identical; a fix in one usually belongs in the other. Both mount with `client:only="svelte"` and fire an `apartments-ready` event that hides the page's spinner.

The detail page `src/pages/apartamente/[unitid].astro` is shared: `getStaticPaths` covers both types, `unitid` is the Sanity `uniqueId`, and the back link is chosen from `_type`.

### Floor plans: SVG ↔ Sanity contract

Each `Parter*.svelte` / `Etaj*.svelte` is a large exported SVG with a few conventions that `Floor.svelte` depends on at runtime:

- The clickable apartment shape (`<rect>`/`<path>`) has `id="<uniqueId>"`, e.g. `ap5` for Corp A, `ap5-b` for Corp B. This id **is** the Sanity `uniqueId`, so the two must stay in sync.
- Labels are `<tspan class="primary-label" data-ap-id="ap5">` (name) and `<tspan class="secondary-label" data-ap-id="ap5">` (room count), each inside a `<text transform="matrix(...)">`. `Floor.svelte` clones the secondary label's `<text>` and reads its matrix to position the injected `VÂNDUT` / `DISPONIBIL` status tag, so keep that structure when editing SVGs.
- Sold units get the `apartment-sold` class, which fills with the `#apartment-sold-stripes` pattern defined once in `Layout.astro`. Highlight/dim classes (`highlight-apartment`, `no-highlight`) and label styles live in `src/styles/global.css`.
- The floor tabs filter by `unit.floor === floors[idx].name`, so Sanity `floor.name` values must be exactly `Parter`, `Etajul 1`, `Etajul 2`, `Etajul 3`.

### Static content

Non-CMS copy lives in `src/config/*.ts` (`buildings`, `contact`, `finishes`, `map`, `techDetails`); components import these rather than hard-coding strings. `BuildingStatus.astro` renders the Corp A / Corp B panels from `config/buildings.ts`.

### Styling

Tailwind 4 via `@tailwindcss/vite`; the theme (fonts Amiko + Josefin Sans, brand colors) is declared with `@theme` in `src/styles/global.css`, and reusable classes (`btn-primary`, `section-x-padding`, `bg-main`, the SVG apartment classes) are in its `@layer components` / `@layer utilities` blocks. Prefer those tokens over new hex values. `Layout.astro` provides SEO/OG tags, GTM, Meta Pixel, and Astro `ClientRouter` view transitions (`Navbar`/`Footer` use `transition:persist`; client scripts must re-init on `astro:page-load`/`astro:after-swap`).

### Svelte 5

Components use runes (`$props`, `$state`, `$effect`) and `onclick={...}` syntax, not the legacy `export let` / `on:click` API.

## Formatting

Root: Prettier with `singleQuote`, `semi`, `printWidth: 100`, `prettier-plugin-astro`. Studio (`studio-nosto/package.json`): `semi: false`, `bracketSpacing: false`. Prettier picks the nearest config, so running `npm run format` from the root keeps each half in its own style.

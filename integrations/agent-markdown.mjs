// Markdown content negotiation for agents (https://acceptmarkdown.com), done in
// Vercel's routing layer so it costs nothing at runtime and never touches
// browser traffic:
//
//   GET /            Accept: text/markdown  -> 200, /index.md, text/markdown
//   GET /<unknown>   Accept: text/markdown  -> 404, /404.md,   text/markdown
//   anything else                           -> unchanged (HTML)
//
// Both representations of / and of the 404 carry `Vary: Accept`.
//
// The Astro Vercel adapter writes .vercel/output/config.json itself (Build
// Output API) and ignores vercel.json routes, so this integration edits that
// file after the adapter has written it. Astro puts the adapter first in the
// integration list, so this `astro:build:done` hook runs after the adapter's.

import { readFile, writeFile } from 'node:fs/promises';

/** Case-insensitive character classes, so the regex needs no flags (PCRE and RE2 alike). */
const ci = (text) => text.replace(/[a-z]/gi, (c) => `[${c.toLowerCase()}${c.toUpperCase()}]`);

const OWS = '[ \\t]*';
const MARKDOWN = ci('text/markdown');
const HTML = ci('text/html');
/** `;q=<value>` among a media range's parameters. */
const qParam = (value) => `(?:;[^,;]*)*;${OWS}[qQ]${OWS}=${OWS}${value}${OWS}(?:;[^,]*)?`;
const ANY_BEFORE = `^(?:.*,)?${OWS}`;
const ANY_AFTER = '(?:,.*)?$';

/** `text/markdown` appears as a media range in the Accept header. */
export const ACCEPTS_MARKDOWN = `${ANY_BEFORE}${MARKDOWN}${OWS}(?:;[^,]*)?${ANY_AFTER}`;

/**
 * Cases where Markdown must not be served even though it is listed:
 * - `text/markdown;q=0` explicitly refuses Markdown;
 * - `text/html` at the implicit q=1 next to `text/markdown;q=<1`, in either
 *   order, prefers HTML.
 */
export const PREFERS_OTHER = [
  `${ANY_BEFORE}${MARKDOWN}${OWS}${qParam('0(?:\\.0{0,3})?')}${ANY_AFTER}`,
  `${ANY_BEFORE}${HTML}${OWS},(?:.*,)?${OWS}${MARKDOWN}${OWS}${qParam('0(?:\\.[0-9]{0,3})?')}${ANY_AFTER}`,
  `${ANY_BEFORE}${MARKDOWN}${OWS}${qParam('0(?:\\.[0-9]{0,3})?')},(?:.*,)?${OWS}${HTML}${OWS}${ANY_AFTER}`,
]
  .map((pattern) => `(?:${pattern})`)
  .join('|');

const markdownConditions = {
  has: [{ type: 'header', key: 'accept', value: { re: ACCEPTS_MARKDOWN } }],
  missing: [{ type: 'header', key: 'accept', value: { re: PREFERS_OTHER } }],
};

const MARKDOWN_TYPE = 'text/markdown; charset=utf-8';
const VARY = { Vary: 'Accept' };
const HOME = '^/(?:index\\.html)?$';

/**
 * Returns a copy of a Build Output API config with the negotiation routes
 * added. Throws if the adapter's output no longer has the shape this relies on,
 * so an adapter upgrade cannot silently switch the feature off.
 */
export function addAgentRoutes(config) {
  const routes = structuredClone(config.routes ?? []);
  if (routes.some((route) => route.dest === '/index.md')) {
    throw new Error('agent-markdown: routes already patched');
  }

  const filesystem = routes.findIndex((route) => route.handle === 'filesystem');
  if (filesystem === -1) throw new Error('agent-markdown: no `handle: filesystem` route found');

  routes.splice(
    filesystem,
    0,
    // Both representations of / vary on Accept.
    { src: HOME, headers: VARY, continue: true },
    // Served negotiated at /, the Markdown must not be indexed at its own URL.
    { src: '^/(?:index|404)\\.md$', headers: { 'X-Robots-Tag': 'noindex' }, continue: true },
    { src: HOME, ...markdownConditions, dest: '/index.md', check: true }
  );

  const notFound = routes.findIndex(
    (route, index) => index > filesystem && route.dest === '/404.html' && route.status === 404
  );
  if (notFound === -1) throw new Error('agent-markdown: no prerendered 404 route found');

  routes[notFound] = { ...routes[notFound], headers: { ...routes[notFound].headers, ...VARY } };
  routes.splice(notFound, 0, {
    src: '^/.*$',
    ...markdownConditions,
    dest: '/404.md',
    status: 404,
    headers: VARY,
  });

  return {
    ...config,
    routes,
    overrides: {
      ...config.overrides,
      'index.md': { contentType: MARKDOWN_TYPE },
      '404.md': { contentType: MARKDOWN_TYPE },
      'llms.txt': { contentType: 'text/plain; charset=utf-8' },
    },
  };
}

/** @returns {import('astro').AstroIntegration} */
export default function agentMarkdown() {
  let root;
  return {
    name: 'agent-markdown',
    hooks: {
      'astro:config:done': ({ config }) => {
        root = config.root;
      },
      'astro:build:done': async ({ logger }) => {
        const file = new URL('.vercel/output/config.json', root);
        const config = JSON.parse(await readFile(file, 'utf-8'));
        await writeFile(file, JSON.stringify(addAgentRoutes(config), null, '\t'));
        logger.info('Added Accept: text/markdown routes to .vercel/output/config.json');
      },
    },
  };
}

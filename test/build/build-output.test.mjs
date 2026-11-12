// Checks the real build output (.vercel/output) after `npm run build`: the
// homepage HTML, the agent files, and that the Accept routes made it into the
// config.json Vercel deploys. Catches an Astro or adapter upgrade that drops
// or reorders them.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const OUTPUT = new URL('../../.vercel/output/', import.meta.url);
const read = (path) => readFile(new URL(path, OUTPUT), 'utf-8');

const html = await read('static/index.html');
const config = JSON.parse(await read('config.json'));

const textOf = (markup) =>
  markup
    .replace(/<(script|style|svg|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

test('homepage: exactly one H1, before every other heading', () => {
  const headings = [...html.matchAll(/<h([1-6])\b/g)].map((match) => Number(match[1]));
  assert.equal(headings.filter((level) => level === 1).length, 1);
  assert.equal(headings[0], 1);
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)[1];
  assert.equal(textOf(h1), 'Nosto – apartamente noi în Timișoara, direct de la dezvoltator');
});

test('homepage: the overview copy is a paragraph again, not a heading', () => {
  assert.match(html, /<p class="indent-12"[^>]*>Proiect NOU in TIMIȘOARA/);
});

test('homepage: meaningful text without JavaScript', () => {
  assert.ok(textOf(html.match(/<main\b[\s\S]*<\/main>/)[0]).length > 2000);
});

test('homepage: RealEstateAgent JSON-LD has a description', () => {
  const blocks = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ];
  const agent = blocks
    .map((block) => JSON.parse(block[1]))
    .find((d) => d['@type'] === 'RealEstateAgent');
  assert.ok(agent, 'RealEstateAgent entity present');
  assert.ok(agent.description.length > 50);
});

test('homepage: advertises its Markdown version', () => {
  assert.match(
    html,
    /<link rel="alternate" type="text\/markdown" href="https:\/\/www\.nosto\.ro\/index\.md"/
  );
});

test('agent files are built', async () => {
  assert.match(await read('static/index.md'), /^# Nosto – apartamente noi/);
  assert.match(await read('static/404.md'), /^# 404 – Pagina nu a fost găsită/);
  assert.match(await read('static/llms.txt'), /^# Nosto\n\n> /);
  const notFound = await read('static/404.html');
  assert.match(notFound, /<h1\b[^>]*>\s*Pagina nu a fost găsită/);
  assert.match(notFound, /<meta name="robots" content="noindex, follow"/);
});

test('sitemap lists no agent files and no 404 page', async () => {
  const sitemap = await read('static/sitemap-0.xml');
  assert.doesNotMatch(sitemap, /\.md<|llms\.txt|\/404/);
});

test('config.json carries the Accept routes, once, around the filesystem step', () => {
  const { routes } = config;
  const filesystem = routes.findIndex((route) => route.handle === 'filesystem');
  const home = routes.filter((route) => route.dest === '/index.md');
  const notFound = routes.findIndex((route) => route.dest === '/404.md');
  const htmlNotFound = routes.findIndex((route) => route.dest === '/404.html');

  assert.equal(home.length, 1);
  assert.ok(routes.indexOf(home[0]) < filesystem, '/index.md rewrite runs before the filesystem');
  assert.ok(filesystem < notFound && notFound < htmlNotFound, 'Markdown 404 precedes HTML 404');
  assert.equal(routes[notFound].status, 404);
  assert.equal(routes[htmlNotFound].headers.Vary, 'Accept');
  assert.equal(config.overrides['index.md'].contentType, 'text/markdown; charset=utf-8');
  assert.equal(config.overrides['404.md'].contentType, 'text/markdown; charset=utf-8');
  assert.equal(config.overrides['llms.txt'].contentType, 'text/plain; charset=utf-8');
});

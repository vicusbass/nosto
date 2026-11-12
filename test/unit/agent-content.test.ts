// The Markdown and llms.txt builders, fed the site's real copy where the config
// module is importable in plain Node (no image imports).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeMarkdown,
  homeMarkdown,
  llmsTxt,
  notFoundMarkdown,
} from '../../src/utils/agentContent.ts';
import { apartmentTypes, homeHeading, overview, siteDescription } from '../../src/config/home.ts';
import contact from '../../src/config/contact.ts';
import map from '../../src/config/map.ts';
import { techDetails } from '../../src/config/techDetails.ts';

const SITE = 'https://www.nosto.ro/';

// buildings.ts and finishes.ts import images, so these mirror their shape.
const buildings = [
  {
    name: 'Corp A',
    statusLabel: 'Finalizat',
    description: 'Construcția este finalizată.',
    ctas: [{ label: 'Vezi apartamentele', href: '/apartamente' }],
  },
  {
    name: 'Corp B',
    statusLabel: 'În construcție',
    description: 'Lucrările sunt în desfășurare.',
    ctas: [{ label: 'Vezi apartamentele', href: '/apartamente-b' }],
  },
];
const finishes = [
  { label: 'PARCHET HARO import GERMANIA', value: 'OAK EMILIA PURO*; SILVER MAPLE VARIO*' },
  { label: 'COLOANĂ DUȘ', value: '' },
];

const home = homeMarkdown({
  siteUrl: SITE,
  heading: homeHeading,
  summary: siteDescription,
  buildingsIntro: 'Proiectul se dezvoltă în două etape.',
  buildings,
  overview,
  apartmentTypes,
  finishes,
  techDetails,
  locationDetails: map.locationDetails,
  contact,
});

const headingLevels = (markdown: string) =>
  markdown
    .split('\n')
    .filter((line) => /^#{1,6} /.test(line))
    .map((line) => line.indexOf(' '));

const links = (markdown: string) =>
  [...markdown.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]);

test('homepage Markdown: a single H1 first, then heading levels that never skip', () => {
  const levels = headingLevels(home);
  assert.equal(levels[0], 1);
  assert.equal(levels.filter((level) => level === 1).length, 1);
  levels
    .slice(1)
    .forEach((level, i) => assert.ok(level <= levels[i] + 1, `skip at heading ${i + 2}`));
  assert.ok(home.startsWith(`# ${homeHeading}\n`));
});

test('homepage Markdown carries the homepage copy', () => {
  assert.ok(home.length > 2000);
  for (const text of [...overview.paragraphs, ...overview.highlights, siteDescription]) {
    assert.ok(home.includes(escapeMarkdown(text.replace(/\s+/g, ' '))), text.slice(0, 40));
  }
  for (const apartment of apartmentTypes) assert.ok(home.includes(`### ${apartment.type}`));
  for (const detail of techDetails) assert.ok(home.includes(`**${detail.title}**`));
  assert.ok(home.includes('Centru Timișoara: 8 minute cu mașina'));
  assert.ok(home.includes(`tel:${contact.phoneInternational}`));
});

test('homepage Markdown escapes copy that would turn into Markdown syntax', () => {
  assert.ok(home.includes('OAK EMILIA PURO\\*; SILVER MAPLE VARIO\\*'));
  assert.ok(home.includes('- **COLOANĂ DUȘ**\n'), 'empty values add no trailing colon');
  assert.equal(escapeMarkdown('a*b_c[d]<e>#f|g`h\\'), 'a\\*b\\_c\\[d\\]\\<e\\>\\#f\\|g\\`h\\\\');
});

test('all links in the generated files are absolute and on the site, or contact links', () => {
  const llms = llmsTxt({ siteUrl: SITE, buildings, contact });
  for (const url of [...links(home), ...links(notFoundMarkdown(SITE)), ...links(llms)]) {
    assert.match(
      url,
      /^(https:\/\/www\.nosto\.ro\/|tel:|mailto:|https:\/\/wa\.me\/|https:\/\/maps\.app\.goo\.gl\/)/
    );
  }
});

test('404 Markdown explains the error and links to the docs, sitemap and homepage', () => {
  const body = notFoundMarkdown(SITE);
  assert.ok(body.startsWith('# 404'));
  assert.ok(body.length >= 20);
  const urls = links(body);
  for (const path of ['', 'llms.txt', 'sitemap-index.xml']) {
    assert.ok(urls.includes(`${SITE}${path}`), path || 'homepage');
  }
});

test('llms.txt follows the llmstxt.org format', () => {
  const lines = llmsTxt({ siteUrl: SITE, buildings, contact }).split('\n');
  // H1 name, then a blockquote summary.
  assert.equal(lines[0], '# Nosto');
  assert.equal(lines[1], '');
  assert.match(lines[2], /^> \S/);
  // Free-form detail sections contain no headings; H2 sections are file lists.
  const firstH2 = lines.findIndex((line) => line.startsWith('## '));
  assert.ok(firstH2 > 3);
  assert.ok(lines.slice(1, firstH2).every((line) => !line.startsWith('#')));
  for (const line of lines.slice(firstH2)) {
    if (line === '' || line.startsWith('## ')) continue;
    assert.match(line, /^- \[[^\]]+\]\(https:\/\/www\.nosto\.ro\/[^)]*\)(: .+)?$/, line);
  }
  assert.ok(lines.includes('## Optional'));
});

test('llms.txt tells agents when to use the site and how to act on it', () => {
  const text = llmsTxt({ siteUrl: SITE, buildings, contact });
  assert.match(text, /^Use nosto\.ro when a user wants to:$/m);
  assert.match(text, /^## When to use: pages by task$/m);
  assert.match(text, /^Do not use it for /m);
  assert.match(text, /^How to act for the user:$/m);
  assert.ok(text.includes('Accept: text/markdown'));
  assert.ok(text.includes(contact.phoneInternational));
  assert.ok(text.includes('Corp A: finalizat; Corp B: în construcție'));
});

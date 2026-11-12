// The Accept-header rules that decide, in Vercel's router, whether a request
// gets Markdown. Checked against a reference negotiator that follows
// https://acceptmarkdown.com/guides/accept-parsing (q-values, specificity, q=0).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACCEPTS_MARKDOWN, PREFERS_OTHER } from '../../integrations/agent-markdown.mjs';

const CHROME =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7';
const FIREFOX = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';

/** What the router does: Markdown when `has` matches and `missing` does not. */
function routed(accept) {
  if (accept === undefined) return 'html';
  const wantsMarkdown =
    new RegExp(ACCEPTS_MARKDOWN).test(accept) && !new RegExp(PREFERS_OTHER).test(accept);
  return wantsMarkdown ? 'markdown' : 'html';
}

/** Reference negotiation between the two representations; HTML wins ties, 'none' means 406. */
function negotiate(accept) {
  if (accept === undefined) return 'html';
  const ranges = accept.split(',').map((entry) => {
    const [type, ...params] = entry.split(';').map((part) => part.trim().toLowerCase());
    const q = params.find((param) => /^q\s*=/.test(param));
    return { type, q: q ? Number(q.split('=')[1]) : 1 };
  });
  const score = (mediaType) => {
    const [major] = mediaType.split('/');
    const match =
      ranges.find((range) => range.type === mediaType) ??
      ranges.find((range) => range.type === `${major}/*`) ??
      ranges.find((range) => range.type === '*/*');
    return match ? match.q : 0;
  };
  const html = score('text/html');
  const markdown = score('text/markdown');
  if (html === 0 && markdown === 0) return 'none';
  return markdown > html ? 'markdown' : 'html';
}

// [Accept header, what is served]: the router and the reference negotiator agree.
const VECTORS = [
  // acceptmarkdown.com test vectors
  ['text/markdown', 'markdown'],
  ['text/markdown, text/html;q=0.8', 'markdown'],
  ['text/html', 'html'],
  ['text/markdown;q=0, text/html', 'html'],
  [undefined, 'html'],
  ['*/*', 'html'],
  // browsers and generic clients
  [CHROME, 'html'],
  [FIREFOX, 'html'],
  ['text/*', 'html'],
  // agents
  ['text/markdown, text/plain;q=0.9, */*;q=0.1', 'markdown'],
  ['text/markdown;charset=utf-8', 'markdown'],
  ['text/markdown; q=1.0', 'markdown'],
  ['TEXT/Markdown', 'markdown'],
  ['application/json, text/markdown;q=0.5', 'markdown'],
  ['text/markdown;q=0.9, text/html;q=0.5', 'markdown'],
  // HTML preferred, or Markdown refused
  ['text/html, text/markdown;q=0.5', 'html'],
  ['text/markdown;q=0.5, text/html', 'html'],
  ['text/markdown;q=0.000, text/html', 'html'],
  ['text/markdown ; q = 0, */*', 'html'],
];

/**
 * Where the router intentionally differs from the reference negotiator.
 * Regexes cannot compare two arbitrary q-values, and a static route cannot
 * answer 406, so these fall back to a sensible representation instead.
 */
const KNOWN_DIFFERENCES = [
  // Both at q=1: the server may choose; an agent that names Markdown gets it.
  ['text/html, text/markdown', 'markdown'],
  // Both explicitly weighted, HTML higher: still served Markdown.
  ['text/html;q=0.9, text/markdown;q=0.5', 'markdown'],
  // Only Markdown, refused: 406 by the book, HTML here.
  ['text/markdown;q=0', 'html'],
  // Neither type acceptable (including look-alike types): 406 by the book, HTML here.
  ['application/pdf', 'html'],
  ['text/x-markdown', 'html'],
  ['text/markdownx', 'html'],
];

for (const [accept, expected] of VECTORS) {
  test(`Accept: ${JSON.stringify(accept)} -> ${expected}`, () => {
    assert.equal(routed(accept), expected);
    assert.equal(negotiate(accept), expected, 'reference negotiator disagrees with the vector');
  });
}

for (const [accept, expected] of KNOWN_DIFFERENCES) {
  test(`known difference, Accept: ${JSON.stringify(accept)} -> ${expected}`, () => {
    assert.equal(routed(accept), expected);
    assert.notEqual(negotiate(accept), expected);
  });
}

test('the regexes use no lookarounds or inline flags, so PCRE and RE2 routers agree', () => {
  for (const pattern of [ACCEPTS_MARKDOWN, PREFERS_OTHER]) {
    assert.doesNotMatch(pattern, /\(\?[=!<]|\(\?[a-z]+\)/);
  }
});

// addAgentRoutes() against a config shaped like the one @astrojs/vercel writes,
// run through a small model of Vercel's router (phases, continue, check, has /
// missing, status, overrides). The model covers only the features these routes
// use: it checks ordering and wiring, not Vercel itself. The deployed behaviour
// is checked by .github/workflows/agent-smoke.yml.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addAgentRoutes } from '../../integrations/agent-markdown.mjs';

const ADAPTER_CONFIG = {
  version: 3,
  routes: [
    {
      src: '^/_astro(?:/(.*))$',
      headers: { 'cache-control': 'public, max-age=31536000, immutable' },
      continue: true,
    },
    { handle: 'filesystem' },
    { src: '^/_image/?$', dest: '_render' },
    { src: '^/api/send-email/?$', dest: '_render' },
    { src: '/.*', dest: '/404.html', status: 404 },
  ],
};

const STATIC_FILES = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/index.md', 'index.md'],
  ['/404.md', '404.md'],
  ['/404.html', '404.html'],
  ['/llms.txt', 'llms.txt'],
  ['/apartamente', 'apartamente/index.html'],
  ['/_astro/app.js', '_astro/app.js'],
]);

const MARKDOWN = 'text/markdown';

function conditionHolds(condition, headers) {
  const value = headers[condition.key];
  if (value === undefined) return false;
  return condition.value?.re ? new RegExp(condition.value.re).test(value) : true;
}

function matches(route, path, headers) {
  if (!new RegExp(route.src).test(path)) return false;
  if (route.has && !route.has.every((c) => conditionHolds(c, headers))) return false;
  if (route.missing && route.missing.some((c) => conditionHolds(c, headers))) return false;
  return true;
}

function serve(config, path, accept) {
  const headers = accept === undefined ? {} : { accept };
  const response = { status: 200, headers: {} };
  const respondWith = (file) => {
    const override = config.overrides?.[file];
    if (override?.contentType) response.headers['content-type'] = override.contentType;
    return { ...response, file };
  };

  const filesystem = config.routes.findIndex((route) => route.handle === 'filesystem');
  const before = config.routes.slice(0, filesystem);
  const after = config.routes.slice(filesystem + 1);

  let current = path;
  for (const route of before) {
    if (!matches(route, current, headers)) continue;
    Object.assign(response.headers, route.headers);
    if (route.dest) current = route.dest;
    if (route.status) response.status = route.status;
    if (route.check && STATIC_FILES.has(current)) return respondWith(STATIC_FILES.get(current));
    if (!route.continue) break;
  }

  if (STATIC_FILES.has(current)) return respondWith(STATIC_FILES.get(current));

  for (const route of after) {
    if (!matches(route, current, headers)) continue;
    Object.assign(response.headers, route.headers);
    if (route.status) response.status = route.status;
    if (route.dest === '_render') return { ...response, file: '_render' };
    return respondWith(STATIC_FILES.get(route.dest));
  }
  throw new Error(`no route for ${path}`);
}

const config = addAgentRoutes(ADAPTER_CONFIG);

test('homepage: Markdown for agents, with Vary and the Markdown Content-Type', () => {
  const response = serve(config, '/', MARKDOWN);
  assert.equal(response.status, 200);
  assert.equal(response.file, 'index.md');
  assert.equal(response.headers['content-type'], 'text/markdown; charset=utf-8');
  assert.equal(response.headers.Vary, 'Accept');
  assert.equal(response.headers['X-Robots-Tag'], undefined, 'negotiated / stays indexable');
});

test('homepage: HTML for browsers, also with Vary', () => {
  for (const accept of [undefined, 'text/html', '*/*']) {
    const response = serve(config, '/', accept);
    assert.equal(response.status, 200);
    assert.equal(response.file, 'index.html');
    assert.equal(response.headers.Vary, 'Accept');
  }
});

test('unknown path: Markdown 404 for agents, HTML 404 otherwise, both with Vary', () => {
  const markdown = serve(config, '/does-not-exist', MARKDOWN);
  assert.equal(markdown.status, 404);
  assert.equal(markdown.file, '404.md');
  assert.equal(markdown.headers['content-type'], 'text/markdown; charset=utf-8');
  assert.equal(markdown.headers.Vary, 'Accept');

  const html = serve(config, '/does-not-exist', 'text/html');
  assert.equal(html.status, 404);
  assert.equal(html.file, '404.html');
  assert.equal(html.headers.Vary, 'Accept');
});

test('existing pages, assets and functions are untouched for Markdown requests', () => {
  assert.equal(serve(config, '/apartamente', MARKDOWN).file, 'apartamente/index.html');
  assert.equal(serve(config, '/apartamente', MARKDOWN).headers.Vary, undefined);
  assert.equal(serve(config, '/_astro/app.js', MARKDOWN).file, '_astro/app.js');
  assert.equal(serve(config, '/api/send-email', MARKDOWN).file, '_render');
});

test('the Markdown files at their own URLs are noindex', () => {
  for (const path of ['/index.md', '/404.md']) {
    assert.equal(serve(config, path, undefined).headers['X-Robots-Tag'], 'noindex');
  }
});

test('llms.txt is served as UTF-8 plain text', () => {
  assert.equal(
    serve(config, '/llms.txt', undefined).headers['content-type'],
    'text/plain; charset=utf-8'
  );
});

test('the adapter routes are kept, and the input is not mutated', () => {
  const before = JSON.stringify(ADAPTER_CONFIG);
  const patched = addAgentRoutes(ADAPTER_CONFIG);
  assert.equal(JSON.stringify(ADAPTER_CONFIG), before);
  for (const route of ADAPTER_CONFIG.routes.slice(0, -1)) {
    assert.ok(patched.routes.some((r) => JSON.stringify(r) === JSON.stringify(route)));
  }
});

test('fails loudly when the adapter output changes shape or is patched twice', () => {
  assert.throws(() => addAgentRoutes({ version: 3, routes: [] }), /filesystem/);
  assert.throws(
    () => addAgentRoutes({ version: 3, routes: [{ handle: 'filesystem' }] }),
    /404 route/
  );
  assert.throws(() => addAgentRoutes(config), /already patched/);
});

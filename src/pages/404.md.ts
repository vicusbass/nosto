import type { APIRoute } from 'astro';
import { notFoundMarkdown } from '../utils/agentContent.ts';

/**
 * Markdown body for unknown URLs requested with `Accept: text/markdown`;
 * served with status 404 by the routing in integrations/agent-markdown.mjs.
 */
export const GET: APIRoute = ({ site }) =>
  new Response(notFoundMarkdown(site!.href), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });

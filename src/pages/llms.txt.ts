import type { APIRoute } from 'astro';
import { llmsTxt } from '../utils/agentContent.ts';
import { buildings } from '../config/buildings.ts';
import contact from '../config/contact.ts';

/** https://llmstxt.org: what nosto.ro is, when an agent should use it, and how. */
export const GET: APIRoute = ({ site }) =>
  new Response(llmsTxt({ siteUrl: site!.href, buildings, contact }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });

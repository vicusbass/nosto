import type { APIRoute } from 'astro';
import { homeMarkdown } from '../utils/agentContent.ts';
import { apartmentTypes, homeHeading, overview, siteDescription } from '../config/home.ts';
import { buildings, buildingsIntro } from '../config/buildings.ts';
import { finishesData } from '../config/finishes.ts';
import { techDetails } from '../config/techDetails.ts';
import map from '../config/map.ts';
import contact from '../config/contact.ts';

/**
 * The homepage as Markdown. Served at /index.md, and at / to requests that
 * prefer `Accept: text/markdown` (routing in integrations/agent-markdown.mjs).
 */
export const GET: APIRoute = ({ site }) =>
  new Response(
    homeMarkdown({
      siteUrl: site!.href,
      heading: homeHeading,
      summary: siteDescription,
      buildingsIntro,
      buildings,
      overview,
      apartmentTypes,
      finishes: finishesData.items,
      techDetails,
      locationDetails: map.locationDetails,
      contact,
    }),
    { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } }
  );

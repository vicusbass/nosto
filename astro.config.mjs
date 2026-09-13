import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import dotenv from 'dotenv';

dotenv.config();

// console.log(process.env.SANITY_STUDIO_PROJECT_ID);

import svelte from '@astrojs/svelte';

import sanity from '@sanity/astro';

import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.nosto.ro',

  build: {
    // Astro's 'auto' default only inlines stylesheets under 4096 bytes, and
    // index.*.css lands at 4568 — so a 1.8 KiB file was costing a full 500ms
    // render-blocking round trip on mobile. Inline both instead.
    inlineStylesheets: 'always',
  },

  integrations: [
    icon(),
    svelte(),
    sanity({
      projectId: process.env.SANITY_STUDIO_PROJECT_ID,
      dataset: 'production',
      useCdn: false,
    }),
    sitemap({
      // The thank-you page is noindex; keep it out of the sitemap too.
      filter: (page) => !page.includes('/multumim'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});

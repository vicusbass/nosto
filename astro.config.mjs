import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import dotenv from 'dotenv';

dotenv.config();

// console.log(process.env.SANITY_STUDIO_PROJECT_ID);

import svelte from '@astrojs/svelte';

import sanity from '@sanity/astro';

import vercelStatic from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://nosto.ro',
  integrations: [
    icon(),
    svelte(),
    sanity({
      projectId: process.env.SANITY_STUDIO_PROJECT_ID,
      dataset: 'production',
      useCdn: false,
    }),
    sitemap(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercelStatic(),

  output: 'static',
});

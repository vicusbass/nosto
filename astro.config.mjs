import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env.SANITY_STUDIO_PROJECT_ID);

import svelte from '@astrojs/svelte';

import sanity from '@sanity/astro';

import vercelStatic from '@astrojs/vercel';

export default defineConfig({
  integrations: [
    icon(),
    svelte(),
    sanity({
      projectId: process.env.SANITY_STUDIO_PROJECT_ID,
      dataset: 'production',
      useCdn: false,
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercelStatic({
    webAnalytics: { enabled: true },
  }),

  output: 'static',
});

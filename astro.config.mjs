import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import sanity from '@sanity/astro';
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env.SANITY_STUDIO_PROJECT_ID)

export default defineConfig({
  integrations: [
    icon(),
    sanity({
      projectId: process.env.SANITY_STUDIO_PROJECT_ID,
      dataset: 'production',
      useCdn: false,
    })
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ]
  }
});
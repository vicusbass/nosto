import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import icon from 'astro-icon';

import svelte from '@astrojs/svelte';

export default defineConfig({
  integrations: [icon(), svelte()],

  vite: {
    plugins: [tailwindcss()]
  }
});
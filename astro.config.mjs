import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://voidscribestudios.com',
  integrations: [svelte(), sitemap()],
  redirects: {
    '/': '/kyle-rudd',
  },
});

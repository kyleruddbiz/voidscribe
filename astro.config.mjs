import { defineConfig, envField } from 'astro/config';

import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://voidscribestudios.com',
  integrations: [svelte(), sitemap()],
  env: {
    schema: {
      ITCH_ACCESS_CODE: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
    },
  },
});

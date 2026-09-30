import { defineConfig, envField } from 'astro/config';

import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

const site = 'https://voidscribestudios.com';

export default defineConfig({
  site,
  integrations: [svelte(), sitemap({ filter: (page) => page !== `${site}/` })],
  env: {
    schema: {
      ITCH_ACCESS_CODE: envField.string({
        context: 'server',
        access: 'public',
      }),
    },
  },
});

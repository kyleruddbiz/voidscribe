import { itchIoIconPath } from '../../../../lib/simple-icons';
import { Skill } from '../../../../lib/portfolio';
import type { PortfolioEntry } from '../../../../lib/portfolio';
import { renderToHtml } from '../../../../lib/render-to-html';
import { withAccessCode } from '../../../../lib/itch-access';
import { buildPreview } from '../../../../lib/gallery-images';
import preview from './preview.jpg';
import Description from './description.svelte';

export const mtgSimulator: PortfolioEntry = {
  kind: 'link',
  href: withAccessCode('https://voidscribestudios.itch.io/mtg-simulator'),
  rel: 'noopener noreferrer nofollow',
  callToAction: 'Play on itch.io',
  icon: itchIoIconPath,
  title: '<cite>Magic: The Gathering</cite> Simulator',
  skills: [Skill.gameDevelopment, Skill.agenticCoding],
  description:
    'I wondered if the excellent game feel of <a href="https://store.steampowered.com/app/1092790/Inscryption/" target="_blank" rel="noopener" aria-label="Inscryption (opens in a new tab)">Inscryption</a> could survive in a more complex card game. This Unity project aims to find out.',
  preview: await buildPreview(preview),
  page: {
    slug: 'mtg-simulator',
    description: renderToHtml(Description),
  },
};

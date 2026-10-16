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
    'I’ve spent a significant amount of time lately learning game development with Unity (and some Unreal Engine). This project was my way to pull those learnings together in one place without worrying about making a commercially viable product. This is in active development.',
  preview: await buildPreview(preview),
  page: {
    slug: 'mtg-simulator',
    description: renderToHtml(Description),
  },
};

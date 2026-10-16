import { youtubeIconPath } from '../../../../lib/simple-icons';
import { Skill } from '../../../../lib/portfolio';
import type { PortfolioEntry } from '../../../../lib/portfolio';
import { renderToHtml } from '../../../../lib/render-to-html';
import { buildPreview } from '../../../../lib/gallery-images';
import preview from './preview.jpg';
import Description from './description.svelte';

export const familyTripMix: PortfolioEntry = {
  kind: 'link',
  href: 'https://www.youtube.com/watch?v=tcXh7IcB0-I',
  callToAction: 'Watch on YouTube',
  icon: youtubeIconPath,
  title: 'Family Trip Mix 2 (Sellout Edition)',
  skills: [Skill.videoEditing, Skill.mixtapeProduction],
  description: renderToHtml(Description),
  preview: await buildPreview(preview),
};

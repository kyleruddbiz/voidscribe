import { soundcloudIconPath } from '../../../../lib/simple-icons';
import { Skill } from '../../../../lib/portfolio';
import type { PortfolioEntry } from '../../../../lib/portfolio';
import { buildPreview } from '../../../../lib/gallery-images';
import preview from './preview.jpg';

export const theFoxKnows: PortfolioEntry = {
  kind: 'link',
  href: 'https://soundcloud.com/eszense/the-fox-knows',
  callToAction: 'Listen on SoundCloud',
  icon: soundcloudIconPath,
  title: 'The Fox Knows',
  skills: [Skill.musicProduction, Skill.songwriting],
  description: 'An older song. It’s a bit chaotic, but I still love this one.',
  preview: await buildPreview(preview),
};

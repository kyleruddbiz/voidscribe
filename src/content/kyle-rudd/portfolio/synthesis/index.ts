import { soundcloudIconPath } from '../../../../lib/simple-icons';
import { Skill } from '../../../../lib/portfolio';
import type { PortfolioEntry } from '../../../../lib/portfolio';
import { buildPreview } from '../../../../lib/gallery-images';
import preview from './preview.jpg';

export const synthesis: PortfolioEntry = {
  kind: 'link',
  href: 'https://on.soundcloud.com/D8LmqAx94iJ004q58i',
  callToAction: 'Listen on SoundCloud',
  icon: soundcloudIconPath,
  title: '[Work In Progress] Synthesis',
  skills: [Skill.musicProduction, Skill.songwriting],
  description:
    'I made this over numerous sessions while in Costa Rica for a music production retreat. It includes many foley sounds I recorded, such as birds and banging on metal. This one shows a lot of promise and I hope to finish it one day.',
  preview: await buildPreview(preview),
};

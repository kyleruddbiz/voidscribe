import { soundcloudIconPath } from '../../../../lib/simple-icons';
import { Skill } from '../../../../lib/portfolio';
import type { PortfolioEntry } from '../../../../lib/portfolio';
import { renderToHtml } from '../../../../lib/render-to-html';
import { buildPreview } from '../../../../lib/gallery-images';
import preview from './preview.jpg';
import Description from './description.svelte';

export const newtonsFlamingLaserSword: PortfolioEntry = {
  kind: 'link',
  href: 'https://soundcloud.com/eszense/newtons-flaming-laser-sword',
  callToAction: 'Listen on SoundCloud',
  icon: soundcloudIconPath,
  title: 'Newton’s Flaming Laser Sword',
  skills: [Skill.musicProduction, Skill.mixingMastering, Skill.songwriting],
  description: renderToHtml(Description),
  preview: await buildPreview(preview),
};

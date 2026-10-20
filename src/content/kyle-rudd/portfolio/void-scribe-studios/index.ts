import { githubIconPath } from '../../../../lib/simple-icons';
import { Skill } from '../../../../lib/portfolio';
import type { PortfolioEntry } from '../../../../lib/portfolio';
import { buildPreview } from '../../../../lib/gallery-images';
import preview from './preview.jpg';

export const voidScribeStudios: PortfolioEntry = {
  kind: 'link',
  href: 'https://github.com/kyleruddbiz/voidscribe',
  callToAction: 'View on GitHub',
  icon: githubIconPath,
  title: 'Void Scribe Studios',
  skills: [Skill.softwareEngineering, Skill.agenticCoding, Skill.uiUxDesign],
  description: 'You are here.',
  preview: await buildPreview(preview),
  page: { slug: 'void-scribe-studios' },
};

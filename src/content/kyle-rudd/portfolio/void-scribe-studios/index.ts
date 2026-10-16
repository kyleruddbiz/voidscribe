import { githubIconPath } from '../../../../lib/simple-icons';
import { Skill } from '../../../../lib/portfolio';
import type { PortfolioEntry } from '../../../../lib/portfolio';
import { renderToHtml } from '../../../../lib/render-to-html';
import { buildPreview } from '../../../../lib/gallery-images';
import preview from './preview.jpg';
import Description from './description.svelte';

export const voidScribeStudios: PortfolioEntry = {
  kind: 'link',
  href: 'https://github.com/kyleruddbiz/voidscribe',
  callToAction: 'View on GitHub',
  icon: githubIconPath,
  title: 'Void Scribe Studios',
  skills: [Skill.softwareEngineering, Skill.uiUxDesign, Skill.agenticCoding],
  description: 'Preview Coming Soon.',
  preview: await buildPreview(preview),
  page: {
    slug: 'void-scribe-studios',
    description: renderToHtml(Description),
  },
};

import { buildGalleryImage } from '../../../lib/gallery-images';
import type { GalleryImage } from '../../../lib/portfolio';
import { renderToHtml } from '../../../lib/render-to-html';
import photo from './photo.jpg';
import Caption from './caption.svelte';

export const profilePhoto: GalleryImage = await buildGalleryImage(
  { image: photo, alt: 'Kyle Rudd', caption: renderToHtml(Caption) },
  { widths: [320, 640], sizes: '10rem' },
);

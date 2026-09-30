import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import type { GalleryImage } from './portfolio';

export interface GalleryEntry {
  image: ImageMetadata;
  alt: string;
}

const thumbnailWidths = [320, 640];
const thumbnailSizes = '(max-width: 480px) 45vw, 10rem';
const maxFullWidth = 2400;

const buildImage = async ({
  image,
  alt,
}: GalleryEntry): Promise<GalleryImage> => {
  const thumbnail = await getImage({
    src: image,
    format: 'webp',
    widths: thumbnailWidths,
    sizes: thumbnailSizes,
  });
  const full = await getImage({
    src: image,
    format: 'webp',
    width: Math.min(image.width, maxFullWidth),
  });

  return {
    alt,
    thumbnail: {
      src: thumbnail.src,
      srcset: thumbnail.srcSet.attribute,
      sizes: thumbnailSizes,
    },
    full: {
      src: full.src,
      width: Number(full.attributes.width),
      height: Number(full.attributes.height),
    },
  };
};

export const buildGallery = (entries: GalleryEntry[]) =>
  Promise.all(entries.map(buildImage));

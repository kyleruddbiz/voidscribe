import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import type { GalleryImage, ResponsiveImage } from './portfolio';

export interface GalleryEntry {
  image: ImageMetadata;
  alt: string;
}

const thumbnailWidths = [320, 640];
const thumbnailSizes = '(max-width: 480px) 45vw, 10rem';
const previewWidths = [480, 960, 1280];
const maxFullWidth = 2400;

const buildResponsiveImage = async (
  image: ImageMetadata,
  widths: number[],
  sizes: string,
): Promise<ResponsiveImage> => {
  const built = await getImage({ src: image, format: 'webp', widths, sizes });

  return { src: built.src, srcset: built.srcSet.attribute, sizes };
};

export const buildPreview = (image: ImageMetadata) =>
  buildResponsiveImage(image, previewWidths, '(max-width: 480px) 100vw, 40rem');

const buildImage = async ({
  image,
  alt,
}: GalleryEntry): Promise<GalleryImage> => {
  const thumbnail = await buildResponsiveImage(
    image,
    thumbnailWidths,
    thumbnailSizes,
  );
  const full = await getImage({
    src: image,
    format: 'webp',
    width: Math.min(image.width, maxFullWidth),
  });

  return {
    alt,
    thumbnail,
    full: {
      src: full.src,
      width: Number(full.attributes.width),
      height: Number(full.attributes.height),
    },
  };
};

export const buildGallery = (entries: GalleryEntry[]) =>
  Promise.all(entries.map(buildImage));

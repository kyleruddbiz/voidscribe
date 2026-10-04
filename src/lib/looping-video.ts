import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

export interface LoopingVideoSource {
  src: string;
  type: string;
}

export interface LoopingVideo {
  alt: string;
  poster: string;
  width: number;
  height: number;
  sources: LoopingVideoSource[];
}

const maxPosterWidth = 1280;

export interface LoopingVideoEntry {
  poster: ImageMetadata;
  sources: LoopingVideoSource[];
  alt: string;
}

export const buildLoopingVideo = async ({
  poster,
  sources,
  alt,
}: LoopingVideoEntry): Promise<LoopingVideo> => {
  const built = await getImage({
    src: poster,
    format: 'webp',
    width: Math.min(poster.width, maxPosterWidth),
  });

  return {
    alt,
    poster: built.src,
    width: poster.width,
    height: poster.height,
    sources,
  };
};

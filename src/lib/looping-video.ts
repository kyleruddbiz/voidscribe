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

export interface VideoPoster {
  poster: string;
  width: number;
  height: number;
}

export const buildVideoPoster = async (
  poster: ImageMetadata,
): Promise<VideoPoster> => {
  const built = await getImage({
    src: poster,
    format: 'webp',
    width: Math.min(poster.width, maxPosterWidth),
  });

  return { poster: built.src, width: poster.width, height: poster.height };
};

export const buildLoopingVideo = async ({
  poster,
  sources,
  alt,
}: LoopingVideoEntry): Promise<LoopingVideo> => ({
  alt,
  ...(await buildVideoPoster(poster)),
  sources,
});

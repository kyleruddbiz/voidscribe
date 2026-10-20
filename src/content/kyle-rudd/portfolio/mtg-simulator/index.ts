import { itchIoIconPath } from '../../../../lib/simple-icons';
import type { ImageMetadata } from 'astro';
import { Skill } from '../../../../lib/portfolio';
import type { PageMedia, PortfolioEntry } from '../../../../lib/portfolio';
import { renderToHtml } from '../../../../lib/render-to-html';
import { withAccessCode } from '../../../../lib/itch-access';
import { buildPreview } from '../../../../lib/gallery-images';
import { buildLoopingVideo } from '../../../../lib/looping-video';
import preview from './preview.jpg';
import physicalDecks from './physical-decks.jpg';
import ciCd from './ci-cd.jpg';
import playCardsPoster from './play-cards.jpg';
import playCardsUrl from './play-cards.mp4?url';
import browseLibraryPoster from './browse-library.jpg';
import browseLibraryUrl from './browse-library.mp4?url';
import mulliganPoster from './mulligan.jpg';
import mulliganUrl from './mulligan.mp4?url';
import configsPoster from './configs.jpg';
import configsUrl from './configs.mp4?url';
import joinGamePoster from './join-game.jpg';
import joinGameUrl from './join-game.mp4?url';
import Description from './description.svelte';
import Details from './details.svelte';

const buildVideo = async (
  poster: ImageMetadata,
  url: string,
  alt: string,
): Promise<PageMedia> => ({
  kind: 'video',
  video: await buildLoopingVideo({
    poster,
    sources: [{ src: url, type: 'video/mp4' }],
    alt,
  }),
});

const buildImage = async (
  image: ImageMetadata,
  alt: string,
): Promise<PageMedia> => ({
  kind: 'image',
  alt,
  image: await buildPreview(image),
});

const media = [
  await buildImage(physicalDecks, 'Physical decks'),
  await buildVideo(playCardsPoster, playCardsUrl, 'Playing cards'),
  await buildVideo(
    browseLibraryPoster,
    browseLibraryUrl,
    'Browsing the library',
  ),
  await buildVideo(mulliganPoster, mulliganUrl, 'Taking a mulligan'),
  await buildVideo(configsPoster, configsUrl, 'Game configuration'),
  await buildImage(ciCd, 'Continuous integration and deployment pipeline'),
  await buildVideo(joinGamePoster, joinGameUrl, 'Joining a game'),
];

export const mtgSimulator: PortfolioEntry = {
  kind: 'link',
  href: withAccessCode('https://voidscribestudios.itch.io/mtg-simulator'),
  rel: 'noopener noreferrer nofollow',
  callToAction: 'Play on itch.io',
  icon: itchIoIconPath,
  title: '<cite>Magic: The Gathering</cite> Simulator',
  skills: [Skill.gameDevelopment, Skill.agenticCoding],
  description: renderToHtml(Description),
  preview: await buildPreview(preview),
  page: {
    slug: 'mtg-simulator',
    details: renderToHtml(Details),
    media,
  },
};

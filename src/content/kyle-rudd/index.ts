import {
  githubIconPath,
  itchIoIconPath,
  soundcloudIconPath,
  youtubeIconPath,
} from '../../lib/simple-icons';
import { RoleName, Skill } from '../../lib/portfolio';
import type { PortfolioEntry, Profile, Role } from '../../lib/portfolio';
import { renderToHtml } from '../../lib/render-to-html';
import { withAccessCode } from '../../lib/itch-access';
import { aetherealArtIconPath } from '../../lib/custom-icons';
import { buildGallery, buildPreview } from '../../lib/gallery-images';
import { buildLoopingVideo } from '../../lib/looping-video';
import { aetherealArt } from './aethereal-art';
import djingInCostaRicaPoster from './djing-in-costa-rica.jpg';
import djingInCostaRicaVideoUrl from './djing-in-costa-rica.mp4?url';
import voidScribeStudiosImage from './void-scribe-studios.jpg';
import mtgSimulatorImage from './mtg-simulator.jpg';
import newtonsFlamingLaserSwordImage from './newtons-flaming-laser-sword.jpg';
import synthesisImage from './synthesis.jpg';
import theFoxKnowsImage from './the-fox-knows.jpg';
import VoidScribeStudiosDescription from './void-scribe-studios.svelte';
import familyTripMixImage from './family-trip-mix.jpg';
import FamilyTripMixDescription from './family-trip-mix.svelte';
import MtgSimulatorDescription from './mtg-simulator.svelte';
import NewtonsFlamingLaserSwordDescription from './newtons-flaming-laser-sword.svelte';
import GeneralBio from './bio/general.svelte';
import SoftwareEngineerBio from './bio/software-engineer.svelte';
import MusicProducerBio from './bio/music-producer.svelte';
import DigitalArtistBio from './bio/digital-artist.svelte';

const name = 'Kyle Rudd';

const roles: Role[] = [
  {
    name: RoleName.softwareEngineer,
    bio: renderToHtml(SoftwareEngineerBio),
    skills: [
      Skill.softwareEngineering,
      Skill.architectureDesign,
      Skill.agenticCoding,
      Skill.gameDevelopment,
    ],
  },
  {
    name: RoleName.musicProducer,
    bio: renderToHtml(MusicProducerBio),
    video: await buildLoopingVideo({
      poster: djingInCostaRicaPoster,
      sources: [{ src: djingInCostaRicaVideoUrl, type: 'video/mp4' }],
      alt: 'DJing in Costa Rica',
    }),
    skills: [
      Skill.mixtapeProduction,
      Skill.musicProduction,
      Skill.mixingMastering,
      Skill.songwriting,
    ],
  },
  {
    name: RoleName.digitalArtist,
    bio: renderToHtml(DigitalArtistBio),
    skills: [
      Skill.gameDevelopment,
      Skill.videoEditing,
      Skill.uiUxDesign,
      Skill.digitalCollage,
      Skill.photoManipulation,
      Skill.surrealismGlitch,
    ],
  },
];

const mtgSimulatorHref = withAccessCode(
  'https://voidscribestudios.itch.io/mtg-simulator',
);

const portfolio: PortfolioEntry[] = [
  {
    kind: 'link',
    href: 'https://github.com/kyleruddbiz/voidscribe',
    callToAction: 'View on GitHub',
    icon: githubIconPath,
    title: 'Void Scribe Studios',
    skills: [Skill.softwareEngineering, Skill.uiUxDesign, Skill.agenticCoding],
    description:
      'What is this website? I have a very eclectic skillset and this can look like chaos at first glance. My aim here is to remedy that chaos.',
    preview: await buildPreview(voidScribeStudiosImage),
    page: {
      slug: 'void-scribe-studios',
      description: renderToHtml(VoidScribeStudiosDescription),
    },
  },
  {
    kind: 'link',
    href: mtgSimulatorHref,
    rel: 'noopener noreferrer nofollow',
    callToAction: 'Play on itch.io',
    icon: itchIoIconPath,
    title: '<cite>Magic: The Gathering</cite> Simulator',
    skills: [Skill.gameDevelopment, Skill.agenticCoding],
    description:
      'I’ve spent a significant amount of time lately learning game development with Unity (and some Unreal Engine). This project was my way to pull those learnings together in one place without worrying about making a commercially viable product. This is in active development.',
    preview: await buildPreview(mtgSimulatorImage),
    page: {
      slug: 'mtg-simulator',
      description: renderToHtml(MtgSimulatorDescription),
    },
  },
  {
    kind: 'link',
    href: 'https://soundcloud.com/eszense/newtons-flaming-laser-sword',
    callToAction: 'Listen on SoundCloud',
    icon: soundcloudIconPath,
    title: 'Newton’s Flaming Laser Sword',
    skills: [Skill.musicProduction, Skill.mixingMastering, Skill.songwriting],
    description: renderToHtml(NewtonsFlamingLaserSwordDescription),
    preview: await buildPreview(newtonsFlamingLaserSwordImage),
  },
  {
    kind: 'link',
    href: 'https://on.soundcloud.com/D8LmqAx94iJ004q58i',
    callToAction: 'Listen on SoundCloud',
    icon: soundcloudIconPath,
    title: '[Work In Progress] Synthesis',
    skills: [Skill.musicProduction, Skill.songwriting],
    description:
      'I made this over numerous sessions while in Costa Rica for a music production retreat. It includes many foley sounds I recorded, such as birds and banging on metal. This one shows a lot of promise and I hope to finish it one day.',
    preview: await buildPreview(synthesisImage),
  },
  {
    kind: 'link',
    href: 'https://soundcloud.com/eszense/the-fox-knows',
    callToAction: 'Listen on SoundCloud',
    icon: soundcloudIconPath,
    title: 'The Fox Knows',
    skills: [Skill.musicProduction, Skill.songwriting],
    description:
      'An older song. It’s a bit chaotic, but I still love this one.',
    preview: await buildPreview(theFoxKnowsImage),
  },
  {
    kind: 'link',
    href: 'https://www.youtube.com/watch?v=tcXh7IcB0-I',
    callToAction: 'Watch on YouTube',
    icon: youtubeIconPath,
    title: 'Family Trip Mix 2 (Sellout Edition)',
    skills: [Skill.videoEditing, Skill.mixtapeProduction],
    description: renderToHtml(FamilyTripMixDescription),
    preview: await buildPreview(familyTripMixImage),
  },
  {
    kind: 'gallery',
    icon: aetherealArtIconPath,
    title: 'Æthereal Art',
    skills: [
      Skill.digitalCollage,
      Skill.photoManipulation,
      Skill.surrealismGlitch,
    ],
    description: 'Art pieces I’ve made over the years.',
    images: await buildGallery(aetherealArt),
  },
];

export const kyleRudd: Profile = {
  name,
  bio: renderToHtml(GeneralBio),
  roles,
  defaultRole: RoleName.softwareEngineer,
  tagline: `${new Intl.ListFormat('en').format(roles.map((role) => role.name))}.`,
  portfolio,
};

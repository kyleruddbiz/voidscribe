import {
  githubIconPath,
  itchIoIconPath,
  linkedinIconPath,
  soundcloudIconPath,
  youtubeIconPath,
} from '../lib/simple-icons';
import { RoleName, Skill } from '../lib/portfolio';
import type { PortfolioEntry, Profile, Role } from '../lib/portfolio';
import { withAccessCode } from '../lib/itch-access';
import { aetherealArtIconPath } from '../lib/custom-icons';
import { buildGallery, buildPreview } from '../lib/gallery-images';
import { buildLoopingVideo } from '../lib/looping-video';
import { aetherealArt } from './kyle-rudd/aethereal-art';
import djingInCostaRicaPoster from './kyle-rudd/djing-in-costa-rica.jpg';
import djingInCostaRicaVideoUrl from './kyle-rudd/djing-in-costa-rica.mp4?url';
import linkedinImage from './kyle-rudd/linkedin.jpg';
import voidScribeStudiosImage from './kyle-rudd/void-scribe-studios.jpg';
import mtgSimulatorImage from './kyle-rudd/mtg-simulator.jpg';
import newtonsFlamingLaserSwordImage from './kyle-rudd/newtons-flaming-laser-sword.jpg';
import synthesisImage from './kyle-rudd/synthesis.jpg';
import theFoxKnowsImage from './kyle-rudd/the-fox-knows.jpg';
import familyTripMixImage from './kyle-rudd/family-trip-mix.jpg';
import familyTripMixDescription from './kyle-rudd/family-trip-mix.html?raw';
import newtonsFlamingLaserSwordDescription from './kyle-rudd/newtons-flaming-laser-sword.html?raw';
import generalBio from './kyle-rudd/bio/general.html?raw';
import softwareEngineerBio from './kyle-rudd/bio/software-engineer.html?raw';
import musicProducerBio from './kyle-rudd/bio/music-producer.html?raw';
import digitalArtistBio from './kyle-rudd/bio/digital-artist.html?raw';

const name = 'Kyle Rudd';

const roles: Role[] = [
  {
    name: RoleName.softwareEngineer,
    bio: softwareEngineerBio,
    skills: [
      Skill.softwareEngineering,
      Skill.architectureDesign,
      Skill.agenticCoding,
      Skill.gameDevelopment,
    ],
  },
  {
    name: RoleName.musicProducer,
    bio: musicProducerBio,
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
    bio: digitalArtistBio,
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
    href: 'https://www.linkedin.com/in/kyle-n-rudd/',
    callToAction: 'View profile',
    icon: linkedinIconPath,
    title: 'LinkedIn',
    skills: [
      Skill.softwareEngineering,
      Skill.architectureDesign,
      Skill.agenticCoding,
    ],
    description:
      'See what I’ve been up to as a professional software engineer.',
    preview: await buildPreview(linkedinImage),
  },
  {
    kind: 'link',
    href: 'https://github.com/kyleruddbiz/voidscribe',
    callToAction: 'View on GitHub',
    icon: githubIconPath,
    title: 'Void Scribe Studios',
    skills: [Skill.softwareEngineering, Skill.uiUxDesign, Skill.agenticCoding],
    description:
      'What is this website? I have a very eclectic skillset and this can look like chaos at first glance. My aim is to remedy that chaos.',
    preview: await buildPreview(voidScribeStudiosImage),
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
  },
  {
    kind: 'link',
    href: 'https://soundcloud.com/eszense/newtons-flaming-laser-sword',
    callToAction: 'Listen on SoundCloud',
    icon: soundcloudIconPath,
    title: 'Newton’s Flaming Laser Sword',
    skills: [Skill.musicProduction, Skill.mixingMastering, Skill.songwriting],
    description: newtonsFlamingLaserSwordDescription,
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
    description: familyTripMixDescription,
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
  bio: generalBio,
  roles,
  defaultRole: RoleName.softwareEngineer,
  tagline: `${new Intl.ListFormat('en').format(roles.map((role) => role.name))}.`,
  portfolio,
};

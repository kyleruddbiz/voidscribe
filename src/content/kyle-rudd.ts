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
import { aetherealArt } from './kyle-rudd/aethereal-art';
import linkedinImage from './kyle-rudd/linkedin.jpg';
import newtonsFlamingLaserSwordImage from './kyle-rudd/newtons-flaming-laser-sword.jpg';
import synthesisImage from './kyle-rudd/synthesis.jpg';
import theFoxKnowsImage from './kyle-rudd/the-fox-knows.jpg';
import familyTripMixImage from './kyle-rudd/family-trip-mix.jpg';
import familyTripMixDescription from './kyle-rudd/family-trip-mix.html?raw';
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
      Skill.gameDevelopment,
    ],
  },
  {
    name: RoleName.musicProducer,
    bio: musicProducerBio,
    skills: [Skill.mixtapeProduction, Skill.musicProduction, Skill.songwriting],
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
    skills: [Skill.softwareEngineering, Skill.architectureDesign],
    description:
      "See what I've been up to as a professional software engineer.",
    preview: await buildPreview(linkedinImage),
  },
  {
    kind: 'link',
    href: 'https://github.com/kyleruddbiz/voidscribe',
    callToAction: 'View on GitHub',
    icon: githubIconPath,
    title: 'Void Scribe Studios',
    skills: [Skill.softwareEngineering, Skill.uiUxDesign],
    description: 'Coming Soon.',
  },
  {
    kind: 'link',
    href: mtgSimulatorHref,
    rel: 'noopener noreferrer nofollow',
    callToAction: 'Play on itch.io',
    icon: itchIoIconPath,
    title: '<cite>Magic: The Gathering</cite> Simulator',
    skills: [Skill.gameDevelopment],
    description:
      'A learning project to practice Unity 3D, online multiplayer, and game architecture.',
  },
  {
    kind: 'link',
    href: 'https://soundcloud.com/eszense/newtons-flaming-laser-sword',
    callToAction: 'Listen on SoundCloud',
    icon: soundcloudIconPath,
    title: "Newton's Flaming Laser Sword",
    skills: [Skill.musicProduction, Skill.songwriting],
    description: 'Coming soon.',
    preview: await buildPreview(newtonsFlamingLaserSwordImage),
  },
  {
    kind: 'link',
    href: 'https://on.soundcloud.com/D8LmqAx94iJ004q58i',
    callToAction: 'Listen on SoundCloud',
    icon: soundcloudIconPath,
    title: '[Work In Progress] Synthesis',
    skills: [Skill.musicProduction, Skill.songwriting],
    description: 'Coming soon.',
    preview: await buildPreview(synthesisImage),
  },
  {
    kind: 'link',
    href: 'https://soundcloud.com/eszense/the-fox-knows?in=eszense/sets/zombies-from-the-song-graveyard',
    callToAction: 'Listen on SoundCloud',
    icon: soundcloudIconPath,
    title: 'The Fox Knows',
    skills: [Skill.musicProduction, Skill.songwriting],
    description: 'Coming soon.',
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
    description: "Some of my favorite art pieces I've done.",
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

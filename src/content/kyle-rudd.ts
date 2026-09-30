import {
  githubIconPath,
  itchIoIconPath,
  linkedinIconPath,
  youtubeIconPath,
} from '../lib/simple-icons';
import { RoleName, Skill } from '../lib/portfolio';
import type { PortfolioEntry, Profile, Role } from '../lib/portfolio';
import { withAccessCode } from '../lib/itch-access';
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
    skills: [Skill.softwareEngineering, Skill.gameDevelopment],
  },
  {
    name: RoleName.musicProducer,
    bio: musicProducerBio,
    skills: [Skill.mixtapeProduction],
  },
  {
    name: RoleName.digitalArtist,
    bio: digitalArtistBio,
    skills: [Skill.gameDevelopment, Skill.videoEditing, Skill.uiUxDesign],
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
    skills: [Skill.softwareEngineering],
    description:
      "See what I've been up to as a professional software engineer.",
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
    href: 'https://www.youtube.com/watch?v=tcXh7IcB0-I',
    callToAction: 'Watch on YouTube',
    icon: youtubeIconPath,
    title: 'Family Trip Mix 2 (Sellout Edition)',
    skills: [Skill.videoEditing, Skill.mixtapeProduction],
    description: familyTripMixDescription,
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

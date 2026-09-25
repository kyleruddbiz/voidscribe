import {
  githubIconPath,
  itchIoIconPath,
  linkedinIconPath,
  youtubeIconPath,
} from '../lib/simple-icons';
import { withAccessCode } from '../lib/itch-access';
import familyTripMixDescription from './kyle-rudd/family-trip-mix.html?raw';

const name = 'Kyle Rudd';

const Skill = {
  softwareEngineering: 'Software Engineering',
  gameDevelopment: 'Game Development',
  uiUxDesign: 'UI/UX Design',
  videoEditing: 'Video Editing',
  mixtapeProduction: 'Mixtape Production',
} as const;

const roles = [
  {
    name: 'Software Engineer',
    skills: [Skill.softwareEngineering, Skill.gameDevelopment],
  },
  { name: 'Music Producer', skills: [Skill.mixtapeProduction] },
  {
    name: 'Digital Artist',
    skills: [Skill.gameDevelopment, Skill.videoEditing, Skill.uiUxDesign],
  },
] as const;

const mtgSimulatorHref = withAccessCode(
  'https://voidscribestudios.itch.io/mtg-simulator',
);

const portfolio = [
  {
    href: 'https://www.linkedin.com/in/kyle-n-rudd/',
    callToAction: 'View profile',
    icon: linkedinIconPath,
    title: 'LinkedIn',
    skills: [Skill.softwareEngineering],
    description:
      "See what I've been up to as a professional software engineer.",
  },
  {
    href: 'https://github.com/kyleruddbiz/voidscribe',
    callToAction: 'View on GitHub',
    icon: githubIconPath,
    title: 'Void Scribe Studios',
    skills: [Skill.softwareEngineering, Skill.uiUxDesign],
    description: 'Coming Soon.',
  },
  {
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
    href: 'https://www.youtube.com/watch?v=tcXh7IcB0-I',
    callToAction: 'Watch on YouTube',
    icon: youtubeIconPath,
    title: 'Family Trip Mix 2 (Sellout Edition)',
    skills: [Skill.videoEditing, Skill.mixtapeProduction],
    description: familyTripMixDescription,
  },
] as const;

export const kyleRudd = {
  name,
  roles,
  tagline: `${new Intl.ListFormat('en').format(roles.map((role) => role.name))}.`,
  portfolio,
} as const;

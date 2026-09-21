import { ITCH_ACCESS_CODE } from 'astro:env/server';
import {
  githubIconPath,
  itchIoIconPath,
  linkedinIconPath,
  youtubeIconPath,
} from '../lib/icon-paths';
import familyTripMixDescription from './kyle-rudd/family-trip-mix.html?raw';

const name = 'Kyle Rudd';

const roles = [
  'Software Engineer',
  'Music Producer',
  'Digital Artist',
] as const;

const itchQueryKeyCodes = [112, 97, 115, 115, 119, 111, 114, 100];
const itchQueryKey = String.fromCharCode(...itchQueryKeyCodes);
const itchAccessCode = decodeURIComponent(ITCH_ACCESS_CODE ?? '');
const mtgSimulatorHref = itchAccessCode
  ? `https://voidscribestudios.itch.io/mtg-simulator?${itchQueryKey}=${encodeURIComponent(itchAccessCode)}`
  : 'https://voidscribestudios.itch.io/mtg-simulator';

// `title` and `description` are HTML strings. Descriptions too complex to
// inline live in ./kyle-rudd/ and are imported as raw text.
const portfolio = [
  {
    href: 'https://www.linkedin.com/in/kyle-n-rudd/',
    callToAction: 'View profile',
    icon: linkedinIconPath,
    title: 'LinkedIn',
    description:
      "See what I've been up to as a professional software engineer.",
  },
  {
    href: 'https://github.com/kyleruddbiz/voidscribe',
    callToAction: 'View on GitHub',
    // Placeholder until the vortex logo is cleaned up into a usable icon.
    icon: githubIconPath,
    title: 'Void Scribe Studios',
    description: 'Coming Soon.',
  },
  {
    href: mtgSimulatorHref,
    rel: 'noopener noreferrer nofollow',
    callToAction: 'Play on itch.io',
    icon: itchIoIconPath,
    title: '<cite>Magic: The Gathering</cite> Simulator',
    description:
      'A learning project to practice Unity 3D, online multiplayer, and game architecture.',
  },
  {
    href: 'https://www.youtube.com/watch?v=tcXh7IcB0-I',
    callToAction: 'Watch on YouTube',
    icon: youtubeIconPath,
    title: 'Family Trip Mix 2 (Sellout Edition)',
    description: familyTripMixDescription,
  },
] as const;

export const kyleRudd = {
  name,
  roles,
  tagline: `${new Intl.ListFormat('en').format(roles)}.`,
  portfolio,
} as const;

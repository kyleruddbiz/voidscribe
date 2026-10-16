import { aetherealArtIconPath } from '../../../../lib/custom-icons';
import { Skill } from '../../../../lib/portfolio';
import type { PortfolioEntry } from '../../../../lib/portfolio';
import { buildGallery } from '../../../../lib/gallery-images';
import type { GalleryEntry } from '../../../../lib/gallery-images';
import aetherealize from './aetherealize.jpg';
import coloradoFlag from './colorado-flag.jpg';
import coloradoShirtBack from './colorado-shirt-back.jpg';
import coloradoShirtFront from './colorado-shirt-front.jpg';
import frogGod from './frog-god.jpg';
import lighthouse from './lighthouse.jpg';
import shatteredSouls from './shattered-souls.jpg';
import theGreatBird from './the-great-bird.jpg';
import thorns from './thorns.jpg';
import tomDidntDie from './tom-didnt-die.jpg';

const images: GalleryEntry[] = [
  { image: frogGod, alt: 'Frog God' },
  { image: lighthouse, alt: 'Lighthouse' },
  { image: shatteredSouls, alt: 'Shattered Souls' },
  { image: tomDidntDie, alt: 'Tom Didn’t Die' },
  { image: coloradoFlag, alt: 'Colorado Flag' },
  { image: coloradoShirtFront, alt: 'Colorado Shirt Front' },
  { image: coloradoShirtBack, alt: 'Colorado Shirt Back' },
  { image: aetherealize, alt: 'Ætherealize' },
  { image: theGreatBird, alt: 'The Great Bird' },
  { image: thorns, alt: 'Thorns' },
];

export const aetherealArt: PortfolioEntry = {
  kind: 'gallery',
  icon: aetherealArtIconPath,
  title: 'Æthereal Art',
  skills: [
    Skill.digitalCollage,
    Skill.photoManipulation,
    Skill.surrealismGlitch,
  ],
  description: 'Art pieces I’ve made over the years.',
  images: await buildGallery(images),
};

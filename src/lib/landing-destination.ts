import { landingSlugs } from '../content/landing-slugs';

export const landingHref = (slug: string) => `/kyle-rudd?role=${slug}`;

export const firstLandingHref = () => landingHref(landingSlugs[0]);

export const randomLandingHref = () =>
  landingHref(landingSlugs[Math.floor(Math.random() * landingSlugs.length)]);

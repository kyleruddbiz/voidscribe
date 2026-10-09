import { landingSlugs } from '../content/landing-slugs';
import { readRememberedRole } from './remembered-role';

export const landingHref = (slug: string) =>
  `/kyle-rudd?role=${encodeURIComponent(slug)}`;

export const firstLandingHref = () => landingHref(landingSlugs[0]);

export const randomLandingHref = () =>
  landingHref(landingSlugs[Math.floor(Math.random() * landingSlugs.length)]);

export const returnLandingHref = () => {
  const rememberedRole = readRememberedRole();

  return rememberedRole ? landingHref(rememberedRole) : randomLandingHref();
};

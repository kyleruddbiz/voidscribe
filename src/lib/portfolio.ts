export const Skill = {
  softwareEngineering: 'Software Engineering',
  gameDevelopment: 'Game Development',
  uiUxDesign: 'UI/UX Design',
  videoEditing: 'Video Editing',
  mixtapeProduction: 'Mixtape Production',
  digitalCollage: 'Digital Collage',
  photoManipulation: 'Photo Manipulation',
  surrealismGlitch: 'Surrealism & Glitch',
} as const;

export type Skill = (typeof Skill)[keyof typeof Skill];

interface PortfolioEntryBase {
  icon: string;
  description?: string;
  title: string;
  skills: Skill[];
}

export interface LinkPortfolioEntry extends PortfolioEntryBase {
  kind: 'link';
  href: string;
  rel?: string;
  callToAction: string;
}

export interface GalleryImage {
  alt: string;
  thumbnail: { src: string; srcset: string; sizes: string };
  full: { src: string; width: number; height: number };
}

export interface GalleryPortfolioEntry extends PortfolioEntryBase {
  kind: 'gallery';
  images: GalleryImage[];
}

export type PortfolioEntry = LinkPortfolioEntry | GalleryPortfolioEntry;

export const RoleName = {
  softwareEngineer: 'Software Engineer',
  musicProducer: 'Music Producer',
  digitalArtist: 'Digital Artist',
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export interface Role {
  name: RoleName;
  bio: string;
  skills: Skill[];
}

export interface Profile {
  name: string;
  tagline: string;
  bio: string;
  roles: Role[];
  defaultRole?: RoleName;
  portfolio: PortfolioEntry[];
}

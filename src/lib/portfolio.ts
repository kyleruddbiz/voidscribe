import type { LoopingVideo } from './looping-video';

export const Skill = {
  softwareEngineering: 'Software Engineering',
  architectureDesign: 'Architecture',
  agenticCoding: 'Agentic Coding',
  gameDevelopment: 'Game Development',
  uiUxDesign: 'UI/UX Design',
  videoEditing: 'Video Editing',
  mixtapeProduction: 'Mixtape Production',
  musicProduction: 'Music Production',
  mixingMastering: 'Mixing & Mastering',
  songwriting: 'Songwriting',
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

export interface ResponsiveImage {
  src: string;
  srcset: string;
  sizes: string;
}

export interface LinkPortfolioEntry extends PortfolioEntryBase {
  kind: 'link';
  preview?: ResponsiveImage;
  href: string;
  rel?: string;
  callToAction: string;
  page?: { slug: string; description: string };
}

export interface GalleryImage {
  alt: string;
  thumbnail: ResponsiveImage;
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
  video?: LoopingVideo;
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

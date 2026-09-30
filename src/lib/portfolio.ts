export const Skill = {
  softwareEngineering: 'Software Engineering',
  gameDevelopment: 'Game Development',
  uiUxDesign: 'UI/UX Design',
  videoEditing: 'Video Editing',
  mixtapeProduction: 'Mixtape Production',
} as const;

export type Skill = (typeof Skill)[keyof typeof Skill];

export interface PortfolioEntry {
  href: string;
  rel?: string;
  callToAction: string;
  icon: string;
  description?: string;
  title: string;
  skills: Skill[];
}

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

import { RoleName } from '../../lib/portfolio';
import type { Profile } from '../../lib/portfolio';
import { renderToHtml } from '../../lib/render-to-html';
import GeneralBio from './bio/general.svelte';
import { roles } from './roles';
import { portfolio } from './portfolio';
import { profilePhoto } from './profile-photo';

export const kyleRudd: Profile = {
  name: 'Kyle Rudd',
  photo: profilePhoto,
  bio: renderToHtml(GeneralBio),
  roles,
  defaultRole: RoleName.softwareEngineer,
  tagline: `${new Intl.ListFormat('en').format(roles.map((role) => role.name))}.`,
  portfolio,
};

import { buildGalleryImage } from '../../lib/gallery-images';
import { RoleName } from '../../lib/portfolio';
import type { Profile } from '../../lib/portfolio';
import { renderToHtml } from '../../lib/render-to-html';
import profilePicture from './profile-picture.jpg';
import GeneralBio from './bio/general.svelte';
import { roles } from './roles';
import { portfolio } from './portfolio';

export const kyleRudd: Profile = {
  name: 'Kyle Rudd',
  photo: await buildGalleryImage(
    {
      image: profilePicture,
      alt: 'Kyle Rudd',
      caption:
        'Photo and color correction by <a href="https://example.com">Photographer Name</a>',
    },
    { widths: [320, 640], sizes: '10rem' },
  ),
  bio: renderToHtml(GeneralBio),
  roles,
  defaultRole: RoleName.softwareEngineer,
  tagline: `${new Intl.ListFormat('en').format(roles.map((role) => role.name))}.`,
  portfolio,
};

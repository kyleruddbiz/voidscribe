const name = 'Kyle Rudd';

const roles = [
  'Software Engineer',
  'Music Producer',
  'Digital Artist',
] as const;

export const kyleRudd = {
  name,
  roles,
  tagline: `${new Intl.ListFormat('en').format(roles)}.`,
} as const;

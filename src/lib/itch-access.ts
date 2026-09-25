import { ITCH_ACCESS_CODE } from 'astro:env/server';

const accessKey = String.fromCharCode(112, 97, 115, 115, 119, 111, 114, 100);
const accessCode = decodeURIComponent(ITCH_ACCESS_CODE ?? '');

export const withAccessCode = (url: string) =>
  accessCode ? `${url}?${accessKey}=${encodeURIComponent(accessCode)}` : url;

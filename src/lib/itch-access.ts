const accessKey = String.fromCharCode(112, 97, 115, 115, 119, 111, 114, 100);
const accessCode = decodeURIComponent(import.meta.env.ITCH_ACCESS_CODE ?? '');

export const withAccessCode = (url: string) =>
  accessCode ? `${url}?${accessKey}=${encodeURIComponent(accessCode)}` : url;

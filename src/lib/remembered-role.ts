const storageKey = 'role';

export const readRememberedRole = () => {
  try {
    return sessionStorage.getItem(storageKey);
  } catch {
    return null;
  }
};

export const writeRememberedRole = (slug: string | undefined) => {
  try {
    if (slug) {
      sessionStorage.setItem(storageKey, slug);
    } else {
      sessionStorage.removeItem(storageKey);
    }
  } catch {
    // Storage is unavailable (blocked or private mode); the role just isn't remembered.
  }
};

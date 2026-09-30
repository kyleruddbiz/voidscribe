export const hasTextSelection = () => {
  const selection = getSelection();

  return !!selection && !selection.isCollapsed;
};

export const targetElement = (event: Event) =>
  event.target instanceof Element ? event.target : null;

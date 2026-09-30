export const hasTextSelection = () => {
  const selection = getSelection();

  return !!selection && !selection.isCollapsed;
};

export const targetElement = (event: Event) => {
  if (!(event.target instanceof Element)) {
    throw new TypeError('Expected the event target to be an Element');
  }

  return event.target;
};

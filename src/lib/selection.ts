export const hasTextSelection = () => {
  const selection = getSelection();
  return !!selection && !selection.isCollapsed;
};

export const isSelecting = () => {
  const selection = getSelection();
  return !!selection && !selection.isCollapsed;
};

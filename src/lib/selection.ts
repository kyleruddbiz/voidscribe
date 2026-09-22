// Call from a click handler to tell a drag-select apart from a real press.
// Needed wherever an element keeps its text selectable while also acting as
// a click target: dragging to select still ends in a click on whatever it
// finished over.
export const isSelecting = () => {
  const selection = getSelection();
  return !!selection && !selection.isCollapsed;
};

import type { Attachment } from 'svelte/attachments';
import { hasTextSelection } from './selection';

const middleMouseButton = 1;
const openInBackgroundTab = { ctrlKey: true, metaKey: true };

export const wholeCardLink =
  (getLink: () => HTMLAnchorElement | undefined): Attachment<HTMLElement> =>
  (card) => {
    const clickLink = (modifiers: MouseEventInit) =>
      getLink()?.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          ...modifiers,
        }),
      );

    const onClick = (event: MouseEvent) => {
      const isForwardedClick = !event.isTrusted;
      if (isForwardedClick) return;

      const target = event.target as Element;
      if (target.closest('button')) return;

      const selecting = hasTextSelection();
      if (target.closest('a')) {
        if (selecting) event.preventDefault();
        return;
      }
      if (selecting) return;

      clickLink({
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
      });
    };

    const onAuxClick = (event: MouseEvent) => {
      const target = event.target as Element;
      if (event.button !== middleMouseButton || target.closest('a, button')) {
        return;
      }
      event.preventDefault();
      clickLink(openInBackgroundTab);
    };

    card.addEventListener('click', onClick);
    card.addEventListener('auxclick', onAuxClick);
    return () => {
      card.removeEventListener('click', onClick);
      card.removeEventListener('auxclick', onAuxClick);
    };
  };

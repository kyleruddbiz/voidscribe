const inlineTags = new Set([
  'A',
  'ABBR',
  'B',
  'CITE',
  'CODE',
  'EM',
  'I',
  'MARK',
  'Q',
  'SMALL',
  'SPAN',
  'STRONG',
  'SUB',
  'SUP',
  'U',
]);

const trailingPunctuation = /[\s.,;:!?…\-–—]+$/;

const textNodes = (root: Node) => {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.textContent!.trim()) nodes.push(node as Text);
  }
  return nodes;
};

export interface HtmlTruncator {
  readonly totalCharacterCount: number;
  full(): DocumentFragment;
  upTo(characters: number): DocumentFragment;
  longestFitting(
    render: (content: DocumentFragment) => void,
    fits: () => boolean,
  ): void;
}

export const createTruncator = (html: string, tail: Node): HtmlTruncator => {
  const template = document.createElement('template');
  template.innerHTML = html;
  const totalCharacterCount = textNodes(template.content).reduce(
    (sum, node) => sum + node.length,
    0,
  );

  const full = () => template.content.cloneNode(true) as DocumentFragment;

  const upTo = (characters: number): DocumentFragment => {
    const clone = full();
    let remaining = characters;
    let cut: Text | undefined;
    for (const node of textNodes(clone)) {
      cut = node;
      if (remaining <= node.length) break;
      remaining -= node.length;
    }
    if (!cut) return clone;

    const range = document.createRange();
    range.setStart(cut, Math.min(remaining, cut.length));
    range.setEndAfter(clone.lastChild!);
    range.deleteContents();
    cut.data = cut.data.replace(trailingPunctuation, '');

    let anchor: Node = cut;
    while (
      anchor.parentElement &&
      inlineTags.has(anchor.parentElement.tagName)
    ) {
      anchor = anchor.parentElement;
    }
    (anchor as ChildNode).after(tail);
    return clone;
  };

  const longestFitting = (
    render: (content: DocumentFragment) => void,
    fits: () => boolean,
  ) => {
    let low = 0;
    let high = totalCharacterCount;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      render(upTo(middle));
      if (fits()) {
        low = middle;
      } else {
        high = middle - 1;
      }
    }
    render(upTo(low));
  };

  return { totalCharacterCount, full, upTo, longestFitting };
};

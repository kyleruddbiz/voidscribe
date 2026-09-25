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

const trailingSpaceAndPunctuation = /[\s.,;:!?…\-–—]+$/;

const nonBlankTextNodes = (root: Node) => {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.textContent!.trim()) nodes.push(node as Text);
  }
  return nodes;
};

const outermostInlineAncestor = (node: Node): Node => {
  let outermost = node;
  while (
    outermost.parentElement &&
    inlineTags.has(outermost.parentElement.tagName)
  ) {
    outermost = outermost.parentElement;
  }
  return outermost;
};

const deleteEverythingAfter = (
  container: DocumentFragment,
  text: Text,
  offset: number,
) => {
  const range = document.createRange();
  range.setStart(text, Math.min(offset, text.length));
  range.setEndAfter(container.lastChild!);
  range.deleteContents();
};

export interface HtmlTruncator {
  full(): DocumentFragment;
  longestFitting(
    render: (content: DocumentFragment) => void,
    fits: () => boolean,
  ): void;
}

export const createTruncator = (html: string, tail: Node): HtmlTruncator => {
  const template = document.createElement('template');
  template.innerHTML = html;
  const totalCharacterCount = nonBlankTextNodes(template.content).reduce(
    (sum, node) => sum + node.length,
    0,
  );

  const full = () => template.content.cloneNode(true) as DocumentFragment;

  const truncatedTo = (characterCount: number): DocumentFragment => {
    const clone = full();
    let charactersLeft = characterCount;
    let cutNode: Text | undefined;
    for (const node of nonBlankTextNodes(clone)) {
      cutNode = node;
      if (charactersLeft <= node.length) break;
      charactersLeft -= node.length;
    }
    if (!cutNode) return clone;

    deleteEverythingAfter(clone, cutNode, charactersLeft);
    cutNode.data = cutNode.data.replace(trailingSpaceAndPunctuation, '');
    (outermostInlineAncestor(cutNode) as ChildNode).after(tail);
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
      render(truncatedTo(middle));
      if (fits()) {
        low = middle;
      } else {
        high = middle - 1;
      }
    }
    render(truncatedTo(low));
  };

  return { full, longestFitting };
};

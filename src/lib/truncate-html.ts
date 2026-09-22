// Truncates arbitrary HTML to support expand/collapse: cuts the rendered
// text at a character offset (on a DOM copy, so markup structure is
// preserved) and appends a caller-supplied tail node (e.g. "Show more").

// Wrappers the tail is placed outside of. It stays inside any other
// element, so it lands on the last line of text rather than after a block.
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

// Whitespace and sentence punctuation (including an existing ellipsis and
// dashes) that would collide with a tail beginning in "...".
const trailingPunctuation = /[\s.,;:!?…\-–—]+$/;

// Text nodes that render something, in document order. Whitespace-only
// nodes (the gaps between blocks) are skipped so a cut can never land in
// one, which would strand the tail on a line of its own.
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
  /** The untruncated content, with no tail appended. */
  full(): DocumentFragment;
  /** The content cut to `characters` characters of rendered text, with the tail appended. */
  upTo(characters: number): DocumentFragment;
  /**
   * Binary search over cut points for the longest prefix that, once rendered
   * via `render` and with the tail appended, satisfies `fits`. Leaves the
   * longest fitting prefix rendered.
   */
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

  // Range.deleteContents() does the hard part: it trims the text node the
  // cut lands in, keeps the ancestors that node sits inside of (<p>,
  // <blockquote>), and drops everything after it.
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
    // Trailing punctuation goes too: the tail brings its own "...", and
    // "text.... Show more" or "text,... Show more" reads as a glitch.
    cut.data = cut.data.replace(trailingPunctuation, '');

    // Step out of inline wrappers (<em>, <cite>, ...) but not out of the
    // enclosing block, so the tail sits flush on the last line of text.
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

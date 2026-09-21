<script lang="ts">
  import { onMount, tick, untrack } from 'svelte';

  interface Props {
    href: string;
    rel?: string;
    callToAction: string;
    icon: string;
    description?: string;
    title: string;
  }

  let {
    href,
    rel = 'noopener noreferrer',
    callToAction,
    icon,
    description,
    title,
  }: Props = $props();

  const instanceId = $props.id();
  const descriptionId = `project-description-${instanceId}`;
  const titleId = `project-title-${instanceId}`;
  const expandId = `project-expand-${instanceId}`;
  const collapseId = `project-collapse-${instanceId}`;
  const full = untrack(() => (description ?? '').trim());
  const hasDescription = full.length > 0;

  // Elements a "... Show more" tail may sit inside of. Anything else is
  // treated as a block, which the tail must stay within to land flush.
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
  // dashes) that would collide with the "..." at the cut point.
  const trailingPunctuation = /[\s.,;:!?…\-–—]+$/;

  let descriptionElement = $state<HTMLDivElement>();
  let bodyElement = $state<HTMLDivElement>();
  let collapseElement = $state<HTMLButtonElement>();

  let expanded = $state(false);
  let truncated = $state(false);
  let lastWidth = -1;
  let measuring = false;

  // Parsed once on mount. The description is HTML, so it can't be cut at a
  // character offset of the string: the cut has to happen on a DOM copy.
  let template: HTMLTemplateElement | undefined;
  let tail: HTMLSpanElement | undefined;
  let textLength = 0;

  const fits = (maxHeight: number) =>
    descriptionElement!.scrollHeight <= maxHeight + 1;

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

  const buildTail = () => {
    const element = document.createElement('span');
    element.className = 'project-description-tail';

    const ellipsis = document.createElement('span');
    ellipsis.className = 'project-description-ellipsis';
    ellipsis.setAttribute('aria-hidden', 'true');
    ellipsis.textContent = '...';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'project-expand-inline';
    button.id = expandId;
    button.textContent = 'Show more';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', descriptionId);
    button.setAttribute('aria-labelledby', `${expandId} ${titleId}`);
    button.addEventListener('click', expand);

    element.append(ellipsis, button);
    return element;
  };

  const fullContent = () =>
    template!.content.cloneNode(true) as DocumentFragment;

  // A copy of the description cut off after `budget` characters of rendered
  // text, with the tail appended. Range.deleteContents() does the hard part:
  // it trims the text node the cut lands in, keeps the ancestors that node
  // sits inside of (<p>, <blockquote>), and drops everything after it.
  const contentUpTo = (budget: number) => {
    const clone = fullContent();
    let remaining = budget;
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
    (anchor as ChildNode).after(tail!);
    return clone;
  };

  // Trims the description down to the longest prefix that, together with the
  // "... Show more" tail, still fits within --description-lines lines.
  // Always measures with the tail in place so "... Show more" lands flush
  // at the end of the last line. Runs even while expanded so `truncated`
  // stays current, which lets "Show less" disappear once a resize makes
  // the full text fit without it, and reappear if it later doesn't.
  const trim = () => {
    if (!descriptionElement || !bodyElement || !template) return;
    const styles = getComputedStyle(descriptionElement);
    const lines = parseInt(styles.getPropertyValue('--description-lines'), 10);
    const maxHeight = parseFloat(styles.lineHeight) * lines;

    bodyElement.replaceChildren(fullContent());
    truncated = !fits(maxHeight);
    if (expanded || !truncated) return;

    let low = 0;
    let high = textLength;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      bodyElement.replaceChildren(contentUpTo(middle));
      if (fits(maxHeight)) {
        low = middle;
      } else {
        high = middle - 1;
      }
    }
    bodyElement.replaceChildren(contentUpTo(low));
  };

  // Both buttons are removed or hidden by the toggle that was just pressed,
  // which would drop keyboard and screen reader focus back to the document.
  // Hand it to the button that replaces the one that went away.
  const collapse = () => {
    expanded = false;
    trim();
    tail?.querySelector('button')?.focus();
  };

  async function expand() {
    expanded = true;
    bodyElement?.replaceChildren(fullContent());
    // "Show less" is only unhidden once Svelte has applied `expanded`.
    await tick();
    collapseElement?.focus();
  }

  // Trimming only ever changes the description's height, never its width,
  // so gating re-measurement on width prevents an expand/collapse feedback
  // loop: our own content changes can't produce a resize that triggers
  // another trim.
  const onResize = (width: number) => {
    if (measuring || width === lastWidth) return;
    lastWidth = width;
    measuring = true;
    trim();
    measuring = false;
  };

  onMount(() => {
    if (!hasDescription || !descriptionElement) return;
    template = document.createElement('template');
    template.innerHTML = full;
    textLength = textNodes(template.content).reduce(
      (sum, node) => sum + node.length,
      0,
    );
    tail = buildTail();

    const observer = new ResizeObserver((entries) =>
      onResize(entries[0].contentRect.width),
    );
    observer.observe(descriptionElement);
    return () => observer.disconnect();
  });
</script>

<div class="project">
  <div class="project-row">
    <div class="project-content">
      <a class="project-link" {href} target="_blank" {rel}>
        <span class="project-main">
          <svg class="project-icon" viewBox="0 0 24 24" aria-hidden="true"
            ><path d={icon} /></svg
          >
          <span class="project-title" id={titleId}>{@html title}</span>
        </span>
      </a>
      {#if hasDescription}
        <div
          class="project-description"
          class:is-expanded={expanded}
          id={descriptionId}
          bind:this={descriptionElement}
        >
          <!-- Svelte renders `full` once, so the description is in the static
               HTML. After mount, trim()/expand() own this element's children;
               that's safe because `full` is deliberately non-reactive. -->
          <div bind:this={bodyElement}>{@html full}</div>
        </div>
      {/if}
    </div>
    <span class="project-meta">{callToAction} &rarr;</span>
  </div>
  {#if hasDescription}
    <button
      type="button"
      class="project-expand"
      id={collapseId}
      bind:this={collapseElement}
      aria-expanded={expanded}
      aria-controls={descriptionId}
      aria-labelledby="{collapseId} {titleId}"
      hidden={!expanded || !truncated}
      onclick={collapse}
    >
      Show less
    </button>
  {/if}
</div>

<style>
  .project {
    position: relative;
    padding: 1rem 1.25rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-bg-raised);
  }

  .project:hover,
  .project:focus-within {
    border-color: var(--color-accent);
  }

  .project-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .project-content {
    flex: 1 1 auto;
    min-width: 0;
    padding-right: 1.5rem;
  }

  .project-link {
    text-decoration: none;
  }

  /* Stretches the click target to the whole card while keeping the anchor
     itself scoped to the icon/title, so it never contains another
     interactive element (the "Show more"/"Show less" buttons live outside
     it as ordinary siblings). */
  .project-link::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  .project-main {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .project-icon {
    width: 1.15rem;
    height: 1.15rem;
    flex-shrink: 0;
    fill: var(--color-text-dim);
  }

  .project:hover .project-icon,
  .project:focus-within .project-icon {
    fill: var(--color-accent);
  }

  .project-title {
    font-family: var(--font-display);
    color: var(--color-text);
    font-size: 1.05rem;
  }

  .project-meta {
    color: var(--color-accent-bright);
    font-size: 0.9rem;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* The clamp is a plain max-height, so it works before JS runs and for any
     markup inside. JS then trims the content so "... Show more" lands on the
     last line, rather than the text being cut off mid-line. */
  .project-description {
    --description-lines: 3;
    margin: 0.4rem 0 0;
    color: var(--color-text-dim);
    font-size: 0.9rem;
    line-height: 1.5;
    max-height: calc(1em * 1.5 * var(--description-lines));
    overflow: hidden;
  }

  .project-description.is-expanded {
    max-height: none;
  }

  /* No JS means nothing ever trims the text or reveals the rest, so lift the
     clamp instead. */
  @media (scripting: none) {
    .project-description {
      max-height: none;
    }
  }

  /* The description is HTML injected with {@html} (and rebuilt by trim()),
     so Svelte's scoped styles can't reach it: everything below is :global.
     Zero margins keep the measured height exactly lines * line-height. */
  .project-description :global(p),
  .project-description :global(blockquote) {
    margin: 0;
  }

  .project-description :global(div > * + *) {
    margin-top: 0.6em;
  }

  .project-description :global(blockquote) {
    padding-left: 0.75em;
    border-left: 2px solid var(--color-border);
    font-style: italic;
  }

  /* Keeps "... Show more" together at the end of the last line: it can
     never wrap onto a line of its own, and the trim routine only accepts a
     cut point where the whole tail still fits alongside the visible text. */
  .project-description :global(.project-description-tail) {
    white-space: nowrap;
    font-style: normal;
  }

  .project-description :global(.project-expand-inline) {
    position: relative;
    z-index: 1;
    margin-left: 0.3em;
    padding: 0;
    border: none;
    background: none;
    color: var(--color-accent-bright);
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
  }

  .project-description :global(.project-expand-inline:hover),
  .project-description :global(.project-expand-inline:focus-visible) {
    text-decoration: underline;
  }

  .project-expand {
    position: relative;
    z-index: 1;
    margin-top: 0.4rem;
    padding: 0;
    border: none;
    background: none;
    color: var(--color-accent-bright);
    font-family: inherit;
    font-size: 0.85rem;
    cursor: pointer;
  }

  .project-expand:hover,
  .project-expand:focus-visible {
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    .project {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .project-content {
      padding-right: 0;
      order: 1;
    }

    .project-main {
      justify-content: center;
    }

    .project-description {
      text-align: center;
    }

    .project-meta {
      margin-top: 0.75rem;
      text-align: center;
      white-space: normal;
      order: 3;
    }

    .project-expand {
      order: 2;
      align-self: center;
    }

    /* Dissolves this plain wrapper div so .project-content and
       .project-meta become direct flex children of .project and can be
       reordered around .project-expand. Safe here because the div carries
       no semantics to lose — unlike the anchor, which must stay intact. */
    .project-row {
      display: contents;
    }
  }
</style>

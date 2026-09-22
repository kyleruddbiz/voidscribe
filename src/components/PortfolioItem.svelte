<script lang="ts">
  import { onMount, tick, untrack } from 'svelte';
  import { isSelecting } from '../lib/selection';

  interface Props {
    href: string;
    rel?: string;
    callToAction: string;
    icon: string;
    description?: string;
    title: string;
    skills?: readonly string[];
    activeSkills?: readonly string[];
    dimmed?: boolean;
  }

  let {
    href,
    rel = 'noopener noreferrer',
    callToAction,
    icon,
    description,
    title,
    skills = [],
    activeSkills = [],
    dimmed = false,
  }: Props = $props();

  const instanceId = $props.id();
  const descriptionId = `portfolio-item-description-${instanceId}`;
  const titleId = `portfolio-item-title-${instanceId}`;
  const expandId = `portfolio-item-expand-${instanceId}`;
  const collapseId = `portfolio-item-collapse-${instanceId}`;
  const full = untrack(() => (description ?? '').trim());
  const hasDescription = full.length > 0;

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
  // dashes) that would collide with the "..." at the cut point.
  const trailingPunctuation = /[\s.,;:!?…\-–—]+$/;

  let descriptionElement = $state<HTMLDivElement>();
  let bodyElement = $state<HTMLDivElement>();
  let collapseElement = $state<HTMLButtonElement>();
  let linkElement = $state<HTMLAnchorElement>();

  let expanded = $state(false);
  let truncated = $state(false);
  let lastWidth = -1;

  // Explicit pixel max-height used only while an expand/collapse animation is
  // in flight; undefined the rest of the time, handing max-height back to the
  // CSS classes below (the calc() clamp when collapsed, none when expanded).
  let heightOverride = $state<string | undefined>(undefined);
  // Guards against a resize retrimming content mid-animation, and against a
  // second click re-entering expand()/collapse() before the first finishes.
  let transitioning = false;

  // The collapsed box's actual rendered height, captured by expand() just
  // before it changes anything. collapse() animates back to this rather than
  // collapsedHeight()'s theoretical max: --description-lines is an upper
  // bound, and trimmed content often lands a partial line short of it.
  let restingHeight = 0;

  // Must match the max-height transition duration in the stylesheet below.
  const transitionMs = 300;

  // Resolves once the description's max-height transition finishes, or after
  // transitionMs regardless — the fallback covers prefers-reduced-motion
  // (the transition is disabled below, so no event fires) and a transition
  // with equal start/end heights (nothing to animate, so nothing fires).
  const settled = (element: HTMLElement) =>
    new Promise<void>((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        element.removeEventListener('transitionend', onEnd);
        resolve();
      };
      const onEnd = (event: TransitionEvent) => {
        if (event.target === element && event.propertyName === 'max-height') {
          finish();
        }
      };
      element.addEventListener('transitionend', onEnd);
      setTimeout(finish, transitionMs + 50);
    });

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
    element.className = 'portfolio-item-description-tail';

    const ellipsis = document.createElement('span');
    ellipsis.className = 'portfolio-item-description-ellipsis';
    ellipsis.setAttribute('aria-hidden', 'true');
    ellipsis.textContent = '...';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'portfolio-item-expand-inline';
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

  // The clamped height for the collapsed state, in pixels — both the resting
  // CSS max-height (--description-lines below) and the animation target
  // collapse() shrinks toward.
  const collapsedHeight = () => {
    const styles = getComputedStyle(descriptionElement!);
    const lines = parseInt(styles.getPropertyValue('--description-lines'), 10);
    return parseFloat(styles.lineHeight) * lines;
  };

  // Binary search over budgets for the longest prefix that, with the tail
  // appended, fits within maxHeight. Mutates bodyElement with the result.
  const applyTrim = (maxHeight: number) => {
    let low = 0;
    let high = textLength;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      bodyElement!.replaceChildren(contentUpTo(middle));
      if (fits(maxHeight)) {
        low = middle;
      } else {
        high = middle - 1;
      }
    }
    bodyElement!.replaceChildren(contentUpTo(low));
  };

  // Trims the description to the longest prefix that, with the "... Show more"
  // tail appended, fits within --description-lines lines. Also runs while
  // expanded so `truncated` tracks resizes: "Show less" is hidden whenever
  // the full text fits.
  const trim = () => {
    if (!descriptionElement || !bodyElement || !template) return;
    const maxHeight = collapsedHeight();

    // Expanded content is already the full text; rebuilding it would drop any
    // text selection inside it.
    if (!expanded) bodyElement.replaceChildren(fullContent());
    truncated = !fits(maxHeight);
    if (expanded || !truncated) return;
    applyTrim(maxHeight);
  };

  // Hides "Show less" immediately, before the shrink starts: leaving it up
  // until the box reaches its final height would pop the card's bottom edge
  // the instant it later disappeared. The content stays the full text during
  // the shrink, so it's clipped by overflow rather than popping straight to
  // the truncated prefix; trim() swaps in the tail, faded in, once the box
  // has reached its final height.
  async function collapse() {
    if (transitioning || !expanded || !descriptionElement) return;
    transitioning = true;
    expanded = false;

    const startHeight = descriptionElement.scrollHeight;
    heightOverride = `${startHeight}px`;
    await tick();

    requestAnimationFrame(() => {
      heightOverride = `${restingHeight}px`;
    });
    await settled(descriptionElement);

    tail?.classList.add('is-appearing');
    trim();
    requestAnimationFrame(() => tail?.classList.remove('is-appearing'));

    heightOverride = undefined;
    tail?.querySelector('button')?.focus();
    transitioning = false;
  }

  // Swaps in the full text immediately, then grows the box to fit: pinning
  // the current height first and setting the target a frame later is what
  // makes the max-height transition below animate instead of jumping
  // straight to `none`. "Show less" is unhidden immediately too, so its
  // space is reserved for the grow animation, but stays invisible until the
  // box finishes growing, when it fades in like "Show more" does on collapse.
  async function expand() {
    if (transitioning || expanded || !descriptionElement) return;
    transitioning = true;

    const startHeight = descriptionElement.getBoundingClientRect().height;
    restingHeight = startHeight;
    heightOverride = `${startHeight}px`;
    expanded = true;
    bodyElement?.replaceChildren(fullContent());
    collapseElement?.classList.add('is-appearing');
    await tick();

    const targetHeight = descriptionElement.scrollHeight;
    requestAnimationFrame(() => {
      heightOverride = `${targetHeight}px`;
    });
    await settled(descriptionElement);

    collapseElement?.classList.remove('is-appearing');
    collapseElement?.focus();

    // Hand max-height back to the "is-expanded" class (none), so a later
    // resize isn't stuck at this now-stale pixel value.
    heightOverride = undefined;
    transitioning = false;
  }

  // The card's text sits above the link overlay so it can be selected, which
  // takes it out of the anchor's click area. These handlers forward its clicks
  // to the anchor; clicks on the anchor, links in the description and buttons
  // are left alone.
  const forward = (init: MouseEventInit) =>
    linkElement?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, ...init }),
    );

  const onCardClick = (event: MouseEvent) => {
    // Ignore the click forward() dispatches, or it would loop back in here.
    if (!event.isTrusted) return;
    const target = event.target as Element;
    if (target.closest('button')) return;

    // A drag-select still ends in a click. Don't follow it, and cancel it if it
    // landed on the anchor (a drag within the title).
    const selecting = isSelecting();
    if (target.closest('a')) {
      if (selecting) event.preventDefault();
      return;
    }
    if (selecting) return;

    forward({
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
    });
  };

  // Middle-click fires auxclick, not click. It's forwarded as a ctrl/cmd-click,
  // which opens a background tab. Unlike a left click, it isn't skipped when
  // text is selected: a middle-click never drags, so the selection is stale.
  const onCardAuxClick = (event: MouseEvent) => {
    if (event.button !== 1 || (event.target as Element).closest('a, button')) {
      return;
    }
    event.preventDefault();
    forward({ ctrlKey: true, metaKey: true });
  };

  // Trimming only changes the description's height, never its width, so
  // re-measuring only on width changes keeps our own content changes from
  // triggering another trim.
  const onResize = (width: number) => {
    if (width === lastWidth) return;
    lastWidth = width;
    // An expand/collapse animation owns bodyElement's content and
    // descriptionElement's height until it finishes; retrimming now would
    // clobber both mid-flight.
    if (transitioning) return;
    trim();
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

<!-- Mouse-only convenience: the anchor is still the real, keyboard-operable
     control, so the a11y warnings below don't apply. -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
  class="item"
  class:is-dimmed={dimmed}
  class:is-filtering={activeSkills.length > 0}
  onclick={onCardClick}
  onauxclick={onCardAuxClick}
>
  <div class="item-row">
    <div class="item-content">
      <!-- draggable="false": dragging on a link's text would otherwise drag
           the link instead of selecting the title. -->
      <a
        class="item-link"
        {href}
        target="_blank"
        {rel}
        draggable="false"
        bind:this={linkElement}
      >
        <span class="item-main">
          <svg class="item-icon" viewBox="0 0 24 24" aria-hidden="true"
            ><path d={icon} /></svg
          >
          <span class="item-title" id={titleId}>{@html title}</span>
        </span>
      </a>
      {#if hasDescription}
        <div
          class="item-description"
          class:is-expanded={expanded}
          id={descriptionId}
          style:max-height={heightOverride}
          bind:this={descriptionElement}
        >
          <!-- Rendered here so the text is in the static HTML. `full` is
               non-reactive, so Svelte never touches this element again;
               after mount, trim() and expand() own its children. -->
          <div bind:this={bodyElement}>{@html full}</div>
        </div>
      {/if}
    </div>
    <span class="item-meta">{callToAction} &rarr;</span>
  </div>
  {#if hasDescription}
    <button
      type="button"
      class="item-expand"
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
  {#if skills.length > 0}
    <ul class="item-skills" aria-label="Skills">
      {#each skills as skill (skill)}
        <li class="item-skill" class:is-active={activeSkills.includes(skill)}>
          <span>{skill}</span>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .item {
    position: relative;
    padding: 1rem 1.25rem 1.5rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-bg-raised);
    transition:
      opacity 0.25s ease,
      border-color 0.2s ease;
  }

  .item:hover,
  .item:focus-within {
    border-color: var(--color-accent);
  }

  .item.is-dimmed {
    opacity: 0.45;
  }

  .item.is-dimmed:hover,
  .item.is-dimmed:focus-within {
    opacity: 1;
  }

  /* Chips straddle the bottom border. pointer-events: none lets clicks fall
     through to the card's link overlay, so the whole card stays one target. */
  .item-skills {
    position: absolute;
    left: 1.25rem;
    bottom: 0;
    transform: translateY(50%);
    z-index: 1;
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
    pointer-events: none;
  }

  .item-skill {
    margin-left: 3px;
    padding: 0.02rem 0.7rem;
    transform: skewX(-14deg);
    background: var(--color-accent-bright);
    color: var(--color-bg);
    font-size: 0.8rem;
    font-weight: 600;
    font-variant-caps: all-small-caps;
    letter-spacing: 0.08em;
    line-height: 1.5;
    white-space: nowrap;
    transition: background-color 0.2s ease;
  }

  .item-skill:first-child {
    margin-left: 0;
  }

  /* Counter-skew keeps the label upright. */
  .item-skill > span {
    display: block;
    transform: skewX(14deg);
  }

  /* While a filter is active, chips outside it recede. */
  .item.is-filtering .item-skill:not(.is-active) {
    background: var(--color-accent);
  }

  .item-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .item-content {
    flex: 1 1 auto;
    min-width: 0;
    padding-right: 1.5rem;
  }

  .item-link {
    text-decoration: none;
  }

  /* Stretches the click target across the card's padding and gaps while
     keeping the anchor itself scoped to the icon/title, so it never contains
     another interactive element. The text sits above it (see below), and the
     "Show more"/"Show less" buttons use z-index to stay clickable. */
  .item-link::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  /* Text sits above the overlay so it can be selected; see onCardClick for how
     clicks on it still follow the link. */
  .item-main,
  .item-description,
  .item-meta {
    position: relative;
    z-index: 1;
  }

  .item-description,
  .item-meta {
    cursor: pointer;
  }

  /* Chrome won't start a selection inside a link unless the text is
     explicitly user-select: text (draggable="false" alone isn't enough). */
  .item-title {
    user-select: text;
  }

  .item-main {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .item-icon {
    width: 1.15rem;
    height: 1.15rem;
    flex-shrink: 0;
    fill: var(--color-text-dim);
  }

  .item:hover .item-icon,
  .item:focus-within .item-icon {
    fill: var(--color-accent);
  }

  .item-title {
    font-family: var(--font-display);
    color: var(--color-text);
    font-size: 1.05rem;
  }

  .item-meta {
    color: var(--color-accent-bright);
    font-size: 0.9rem;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* The clamp is a plain max-height, so it works before JS runs and for any
     markup inside. JS then trims the content so "... Show more" lands on the
     last line, rather than the text being cut off mid-line. */
  .item-description {
    --description-lines: 3;
    margin: 0.4rem 0 0;
    color: var(--color-text-dim);
    font-size: 0.9rem;
    line-height: 1.5;
    max-height: calc(1em * 1.5 * var(--description-lines));
    overflow: hidden;
    /* Duration must match transitionMs in the script above. expand()/
       collapse() pin an explicit pixel max-height a frame apart so this
       actually has two concrete values to animate between, rather than
       jumping straight to/from the calc()/none below. */
    transition: max-height 0.3s ease;
  }

  .item-description.is-expanded {
    max-height: none;
  }

  /* Without JS nothing trims the text or adds a "Show more" button, so remove
     the max-height and show the full description. */
  @media (scripting: none) {
    .item-description {
      max-height: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .item-description,
    .item-expand,
    .item-description :global(.portfolio-item-description-tail) {
      transition: none;
    }
  }

  /* The description is HTML injected with {@html} (and rebuilt by trim()),
     so Svelte's scoped styles can't reach it: rules targeting it use
     :global. */
  .item-description :global(p),
  .item-description :global(blockquote) {
    margin: 0;
  }

  /* Spacing between blocks, in place of the margins zeroed above. */
  .item-description :global(div > * + *) {
    margin-top: 0.6em;
  }

  .item-description :global(blockquote) {
    padding-left: 0.75em;
    border-left: 2px solid var(--color-border);
    font-style: italic;
  }

  /* nowrap keeps "... Show more" a single unit, so it wraps whole instead of
     splitting; trim() then rejects any cut that pushes it past the last
     line. Upright so it doesn't inherit a blockquote's italics. */
  .item-description :global(.portfolio-item-description-tail) {
    white-space: nowrap;
    font-style: normal;
    transition: opacity 0.15s ease;
  }

  /* Set by collapse() right before inserting the tail, then cleared a frame
     later so it fades in instead of appearing instantly. */
  .item-description :global(.portfolio-item-description-tail.is-appearing) {
    opacity: 0;
  }

  .item-description :global(.portfolio-item-expand-inline) {
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

  .item-description :global(.portfolio-item-expand-inline:hover),
  .item-description :global(.portfolio-item-expand-inline:focus-visible) {
    text-decoration: underline;
  }

  .item-expand {
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
    transition: opacity 0.15s ease;
  }

  .item-expand:hover,
  .item-expand:focus-visible {
    text-decoration: underline;
  }

  /* Set by expand() right after unhiding this, then cleared once the box
     has finished growing, so it fades in instead of appearing instantly. */
  .item-expand:global(.is-appearing) {
    opacity: 0;
  }

  @media (max-width: 480px) {
    .item {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .item-content {
      padding-right: 0;
      order: 1;
    }

    .item-main {
      justify-content: center;
    }

    .item-description {
      text-align: center;
    }

    .item-meta {
      margin-top: 0.75rem;
      text-align: center;
      white-space: normal;
      order: 3;
    }

    .item-expand {
      order: 2;
      align-self: center;
    }

    .item-skills {
      left: 0;
      right: 0;
      justify-content: center;
    }

    /* Dissolves this plain wrapper div so .item-content and
       .item-meta become direct flex children of .item and can be
       reordered around .item-expand. Safe here because the div carries
       no semantics to lose — unlike the anchor, which must stay intact. */
    .item-row {
      display: contents;
    }
  }
</style>

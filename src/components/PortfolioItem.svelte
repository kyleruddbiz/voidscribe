<script lang="ts">
  import { onMount, tick, untrack } from 'svelte';
  import { hasTextSelection } from '../lib/selection';
  import { createTruncator, type HtmlTruncator } from '../lib/truncate-html';
  import type { PortfolioEntry } from '../lib/portfolio';
  import SkillChips from './SkillChips.svelte';

  interface Props extends PortfolioEntry {
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
    skills,
    activeSkills = [],
    dimmed = false,
  }: Props = $props();

  const instanceId = $props.id();
  const descriptionId = `portfolio-item-description-${instanceId}`;
  const titleId = `portfolio-item-title-${instanceId}`;
  const showMoreId = `portfolio-item-show-more-${instanceId}`;
  const showLessId = `portfolio-item-show-less-${instanceId}`;
  const full = untrack(() => (description ?? '').trim());
  const hasDescription = full.length > 0;

  let descriptionElement = $state<HTMLDivElement>();
  let bodyElement = $state<HTMLDivElement>();
  let tail = $state<HTMLSpanElement>();
  let showMoreElement = $state<HTMLButtonElement>();
  let collapseElement = $state<HTMLButtonElement>();
  let linkElement = $state<HTMLAnchorElement>();

  let expanded = $state(false);
  let truncated = $state(false);
  let revealed = $state(false);
  let settledIn = $state(false);
  let tailAppearing = $state(false);
  let showLessAppearing = $state(false);
  let lastWidth = -1;

  let heightOverride = $state<string | undefined>(undefined);
  let transitioning = false;

  const settled = (element: HTMLElement) =>
    Promise.allSettled(
      element.getAnimations().map((animation) => animation.finished),
    );

  const nextFrame = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  async function animateHeight(
    change: () => void,
    target: () => number,
    from?: number,
  ) {
    if (!descriptionElement) return;
    heightOverride = `${from ?? descriptionElement.getBoundingClientRect().height}px`;
    change();
    await tick();

    await nextFrame();
    heightOverride = `${target()}px`;
    await tick();
    await settled(descriptionElement);

    heightOverride = undefined;
  }

  async function appear(setFrom: (on: boolean) => void, element: HTMLElement) {
    setFrom(true);
    await tick();
    getComputedStyle(element).opacity;
    setFrom(false);
    await tick();
  }

  let truncator: HtmlTruncator | undefined;

  const fits = (maxHeight: number) =>
    descriptionElement!.scrollHeight <= maxHeight + 1;

  const clampHeight = () => {
    const styles = getComputedStyle(descriptionElement!);
    const lines = parseInt(styles.getPropertyValue('--description-lines'), 10);
    return parseFloat(styles.lineHeight) * lines;
  };

  const trim = () => {
    if (!descriptionElement || !bodyElement || !truncator) return;
    const maxHeight = clampHeight();

    if (!expanded) bodyElement.replaceChildren(truncator.full());
    truncated = !fits(maxHeight);
    if (expanded || !truncated) return;
    truncator.longestFitting(
      (content) => bodyElement!.replaceChildren(content),
      () => fits(maxHeight),
    );
  };

  async function collapse() {
    if (
      transitioning ||
      !expanded ||
      !descriptionElement ||
      !bodyElement ||
      !truncator
    ) {
      return;
    }
    transitioning = true;

    const from = descriptionElement.getBoundingClientRect().height;

    const maxHeight = clampHeight();
    truncator.longestFitting(
      (content) => bodyElement!.replaceChildren(content),
      () => fits(maxHeight),
    );
    const collapsedContent = [...bodyElement.childNodes];
    const collapsedContentHeight = descriptionElement.scrollHeight;

    await animateHeight(
      () => {
        bodyElement!.replaceChildren(truncator!.full());
        expanded = false;
      },
      () => collapsedContentHeight,
      from,
    );

    bodyElement.replaceChildren(...collapsedContent);
    if (tail) await appear((on) => (tailAppearing = on), tail);

    showMoreElement?.focus();
    endTransition();
  }

  async function expand() {
    if (transitioning || expanded || !descriptionElement) return;
    transitioning = true;

    showLessAppearing = true;
    await animateHeight(
      () => {
        bodyElement?.replaceChildren(truncator!.full());
        expanded = true;
      },
      () => descriptionElement!.scrollHeight,
    );

    if (collapseElement)
      await appear((on) => (showLessAppearing = on), collapseElement);
    collapseElement?.focus();
    endTransition();
  }

  async function reveal() {
    if (!descriptionElement || !bodyElement || !truncator) return;
    transitioning = true;

    lastWidth = descriptionElement.getBoundingClientRect().width;
    trim();

    await animateHeight(
      () => (revealed = true),
      () => descriptionElement!.scrollHeight,
    );

    settledIn = true;
    endTransition();
  }

  const forward = (init: MouseEventInit) =>
    linkElement?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, ...init }),
    );

  const onCardClick = (event: MouseEvent) => {
    if (!event.isTrusted) return;
    const target = event.target as Element;
    if (target.closest('button')) return;

    const selecting = hasTextSelection();
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

  const onCardAuxClick = (event: MouseEvent) => {
    if (event.button !== 1 || (event.target as Element).closest('a, button')) {
      return;
    }
    event.preventDefault();
    forward({ ctrlKey: true, metaKey: true });
  };

  const onResize = (width: number) => {
    if (transitioning) return;
    if (width === lastWidth) return;
    lastWidth = width;
    trim();
  };

  function endTransition() {
    transitioning = false;
    if (!descriptionElement) return;
    const width = descriptionElement.getBoundingClientRect().width;
    if (width === lastWidth) return;
    lastWidth = width;
    trim();
  }

  onMount(() => {
    if (!hasDescription || !descriptionElement || !tail) return;
    truncator = createTruncator(full, tail);

    const observer = new ResizeObserver((entries) =>
      onResize(entries[0].contentRect.width),
    );
    observer.observe(descriptionElement);
    reveal();
    return () => observer.disconnect();
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
  class="item"
  class:is-dimmed={dimmed}
  class:is-settled={settledIn}
  onclick={onCardClick}
  onauxclick={onCardAuxClick}
>
  <div class="item-row">
    <div class="item-content">
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
          class:is-revealed={revealed}
          id={descriptionId}
          style:max-height={heightOverride}
          bind:this={descriptionElement}
        >
          <div bind:this={bodyElement}>{@html full}</div>
        </div>
        <div hidden>
          <span
            class="item-tail"
            class:is-appearing={tailAppearing}
            bind:this={tail}
          >
            <span aria-hidden="true">...</span>
            <button
              type="button"
              class="item-show-more"
              id={showMoreId}
              bind:this={showMoreElement}
              aria-expanded="false"
              aria-controls={descriptionId}
              aria-labelledby="{showMoreId} {titleId}"
              onclick={expand}
            >
              Show more
            </button>
          </span>
        </div>
      {/if}
    </div>
    <span class="item-meta">{callToAction} &rarr;</span>
  </div>
  {#if hasDescription}
    <button
      type="button"
      class="item-show-less"
      class:is-appearing={showLessAppearing}
      id={showLessId}
      bind:this={collapseElement}
      aria-expanded={expanded}
      aria-controls={descriptionId}
      aria-labelledby="{showLessId} {titleId}"
      hidden={!expanded || !truncated}
      onclick={collapse}
    >
      Show less
    </button>
  {/if}
  <div class="item-skills">
    <SkillChips {skills} {activeSkills} revealed={settledIn} />
  </div>
</div>

<style>
  .item {
    --fade-in: opacity 1.2s ease;
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

  .item-skills {
    position: absolute;
    left: 1.25rem;
    bottom: 0;
    transform: translateY(50%);
    z-index: 1;
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

  .item-link::after {
    content: '';
    position: absolute;
    inset: 0;
  }

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
    transition: opacity 1.2s ease;
  }

  .item-description {
    --description-lines: 3;
    margin: 0.4rem 0 0;
    color: var(--color-text-dim);
    font-size: 0.9rem;
    line-height: 1.5;
    max-height: calc(1em * 1.5 * var(--description-lines));
    overflow: hidden;
    transition:
      max-height 0.6s ease,
      opacity 0.6s ease;
  }

  .item-description.is-expanded {
    max-height: none;
  }

  :global(.js) .item-description:not(.is-revealed) {
    max-height: 0;
    opacity: 0;
  }

  :global(.js) .item:not(.is-settled) .item-meta {
    opacity: 0;
  }

  @media (scripting: none) {
    .item-description {
      max-height: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .item-description,
    .item-show-less,
    .item-tail,
    .item-meta {
      transition: none;
    }
  }

  .item-description :global(p),
  .item-description :global(blockquote) {
    margin: 0;
  }

  .item-description :global(div > * + *) {
    margin-top: 0.6em;
  }

  .item-description :global(blockquote) {
    padding-left: 0.75em;
    border-left: 2px solid var(--color-border);
    font-style: italic;
  }

  .item-tail {
    white-space: nowrap;
    font-style: normal;
    transition: var(--fade-in);
  }

  .item-show-more {
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

  .item-show-more:hover,
  .item-show-more:focus-visible {
    text-decoration: underline;
  }

  .item-show-less {
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
    transition: var(--fade-in);
  }

  .item-show-less:hover,
  .item-show-less:focus-visible {
    text-decoration: underline;
  }

  .item-tail.is-appearing,
  .item-show-less.is-appearing {
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

    .item-show-less {
      order: 2;
      align-self: center;
    }

    .item-skills {
      left: 0;
      right: 0;
      --chips-align: center;
    }

    .item-row {
      display: contents;
    }
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    href: string;
    rel?: string;
    callToAction: string;
    icon: string;
    description?: string;
    title: Snippet;
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
  const full = (description ?? '').trim();
  const hasDescription = full.length > 0;

  let descriptionElement: HTMLParagraphElement | undefined;
  let textElement: HTMLSpanElement | undefined;
  let tailElement: HTMLSpanElement | undefined;

  let mounted = $state(false);
  let expanded = $state(false);
  let truncated = $state(false);
  let lastWidth = -1;
  let measuring = false;

  const fits = (maxHeight: number) =>
    descriptionElement!.scrollHeight <= maxHeight + 1;

  // Trims `full` down to the longest prefix that, together with the
  // "... Show more" tail, still fits within --description-lines lines.
  // Always measures with the tail in place so "... Show more" lands flush
  // at the end of the last line. Runs even while expanded so `truncated`
  // stays current, which lets "Show less" disappear once a resize makes
  // the full text fit without it, and reappear if it later doesn't.
  const trim = () => {
    if (!descriptionElement || !textElement || !tailElement) return;
    const styles = getComputedStyle(descriptionElement);
    const lines = parseInt(styles.getPropertyValue('--description-lines'), 10);
    const maxHeight = parseFloat(styles.lineHeight) * lines;

    tailElement.hidden = true;
    textElement.textContent = full;
    truncated = !fits(maxHeight);
    if (expanded || !truncated) return;

    tailElement.hidden = false;
    let low = 0;
    let high = full.length;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      textElement.textContent = full.slice(0, middle);
      if (fits(maxHeight)) {
        low = middle;
      } else {
        high = middle - 1;
      }
    }
    textElement.textContent = full.slice(0, low).replace(/\s+$/, '');
  };

  const collapse = () => {
    expanded = false;
    trim();
  };

  const expand = () => {
    expanded = true;
    if (textElement) textElement.textContent = full;
    if (tailElement) tailElement.hidden = true;
  };

  // Trimming only ever changes the description's height, never its width,
  // so gating re-measurement on width prevents an expand/collapse feedback
  // loop: our own text mutations can't produce a resize that triggers
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
    mounted = true;
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
          <span class="project-title" id={titleId}>{@render title()}</span>
        </span>
      </a>
      {#if hasDescription}
        <p
          class="project-description"
          class:is-trimmed={mounted && !expanded}
          class:is-expanded={expanded}
          id={descriptionId}
          bind:this={descriptionElement}
        >
          {#if mounted && truncated && !expanded}
            <span class="sr-only">{full}</span>
          {/if}
          <span
            aria-hidden={mounted && truncated && !expanded}
            bind:this={textElement}>{full}</span
          >
          <span class="project-description-tail" bind:this={tailElement} hidden>
            <span class="project-description-ellipsis" aria-hidden="true"
              >...</span
            >
            <button
              type="button"
              class="project-expand-inline"
              id={expandId}
              aria-expanded={expanded}
              aria-controls={descriptionId}
              aria-labelledby="{expandId} {titleId}"
              onclick={expand}
            >
              Show more
            </button>
          </span>
        </p>
      {/if}
    </div>
    <span class="project-meta">{callToAction} &rarr;</span>
  </div>
  {#if hasDescription}
    <button
      type="button"
      class="project-expand"
      id={collapseId}
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

  .project-description {
    --description-lines: 3;
    margin: 0.4rem 0 0;
    color: var(--color-text-dim);
    font-size: 0.9rem;
    line-height: 1.5;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: var(--description-lines);
    -webkit-box-orient: vertical;
  }

  /* Applied once JS takes over. A description short enough to fit as-is
     renders identically in this layout, so it's safe to apply unconditionally
     rather than only to descriptions that end up truncated. */
  .project-description.is-trimmed,
  .project-description.is-expanded {
    display: block;
    -webkit-line-clamp: unset;
  }

  .project-description.is-trimmed {
    max-height: calc(1em * 1.5 * var(--description-lines));
    overflow: hidden;
  }

  .project-description.is-expanded {
    max-height: none;
  }

  /* No JS means .is-trimmed never applies, so the -webkit-line-clamp above
     clamps the text with no way to reveal the rest. Lift the clamp instead. */
  @media (scripting: none) {
    .project-description {
      display: block;
      -webkit-line-clamp: unset;
      max-height: none;
    }
  }

  /* Keeps "... Show more" together at the end of the last line: it can
     never wrap onto a line of its own, and the trim routine only accepts a
     cut point where the whole tail still fits alongside the visible text. */
  .project-description-tail {
    white-space: nowrap;
  }

  .project-expand-inline {
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

  .project-expand-inline:hover,
  .project-expand-inline:focus-visible {
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

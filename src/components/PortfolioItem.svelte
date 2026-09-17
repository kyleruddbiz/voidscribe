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

  let { href, rel = 'noopener noreferrer', callToAction, icon, description, title }: Props = $props();

  const instanceId = $props.id();
  const descriptionId = `project-description-${instanceId}`;
  const full = (description ?? '').trim();
  const hasDescription = full.length > 0;

  let descriptionElement: HTMLParagraphElement | undefined;
  let textElement: HTMLSpanElement | undefined;
  let tailElement: HTMLSpanElement | undefined;

  let mounted = $state(false);
  let expanded = $state(false);
  let lastWidth = -1;
  let measuring = false;

  const fits = (maxHeight: number) => descriptionElement!.scrollHeight <= maxHeight + 1;

  // Trims `full` down to the longest prefix that, together with the
  // "... Show more" tail, still fits in three lines. Always measures with
  // the tail in place so "... Show more" lands flush at the end of line
  // three.
  const trim = () => {
    if (!descriptionElement || !textElement || !tailElement) return;
    const maxHeight = parseFloat(getComputedStyle(descriptionElement).lineHeight) * 3;

    tailElement.hidden = true;
    textElement.textContent = full;
    if (fits(maxHeight)) return;

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

  const activateInline = (event: Event) => {
    // The toggle sits inside the card's <a>; stop the click/keypress from
    // reaching it so "Show more" expands instead of navigating.
    event.preventDefault();
    event.stopPropagation();
    expand();
  };

  const onInlineKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      activateInline(event);
    }
  };

  // Trimming only ever changes the description's height, never its width,
  // so gating re-measurement on width prevents an expand/collapse feedback
  // loop: our own text mutations can't produce a resize that triggers
  // another trim.
  const onResize = (width: number) => {
    if (measuring || width === lastWidth) return;
    lastWidth = width;
    if (expanded) return;
    measuring = true;
    trim();
    measuring = false;
  };

  onMount(() => {
    if (!hasDescription || !descriptionElement) return;
    mounted = true;
    const observer = new ResizeObserver((entries) => onResize(entries[0].contentRect.width));
    observer.observe(descriptionElement);
    return () => observer.disconnect();
  });
</script>

<div class="project" class:project--expandable={hasDescription}>
  <a class="project-link" {href} target="_blank" {rel}>
    <div class="project-content">
      <span class="project-main">
        <svg class="project-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={icon} /></svg>
        <span class="project-title">{@render title()}</span>
      </span>
      {#if hasDescription}
        <p
          class="project-description"
          class:is-trimmed={mounted && !expanded}
          class:is-expanded={expanded}
          id={descriptionId}
          bind:this={descriptionElement}
        >
          <span bind:this={textElement}>{full}</span>
          <span class="project-description-tail" bind:this={tailElement} hidden>
            <span class="project-description-ellipsis" aria-hidden="true">...</span>
            <span
              class="project-expand-inline"
              role="button"
              tabindex="0"
              aria-expanded={expanded}
              aria-controls={descriptionId}
              onclick={activateInline}
              onkeydown={onInlineKeydown}
            >
              Show more
            </span>
          </span>
        </p>
      {/if}
    </div>
    <span class="project-meta">{callToAction} &rarr;</span>
  </a>
  {#if hasDescription}
    <button
      type="button"
      class="project-expand"
      aria-expanded={expanded}
      aria-controls={descriptionId}
      hidden={!expanded}
      onclick={collapse}
    >
      Show less
    </button>
  {/if}
</div>

<style>
  .project {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-bg-raised);
    text-decoration: none;
  }

  .project-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    text-decoration: none;
  }

  .project-content {
    flex: 1 1 auto;
    min-width: 0;
    padding-right: 1.5rem;
  }

  .project--expandable {
    display: block;
  }

  .project:hover,
  .project:focus-visible,
  .project--expandable:hover,
  .project--expandable:focus-within {
    border-color: var(--color-accent);
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
  .project:focus-visible .project-icon,
  .project--expandable:hover .project-icon,
  .project--expandable:focus-within .project-icon {
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
    margin: 0.4rem 0 0;
    color: var(--color-text-dim);
    font-size: 0.9rem;
    line-height: 1.5;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  /* Applied once JS takes over. A description short enough to fit as-is
     renders identically in this layout, so it's safe to apply unconditionally
     rather than only to descriptions that end up truncated. */
  .project-description.is-trimmed {
    display: block;
    -webkit-line-clamp: unset;
    max-height: calc(1.5em * 3);
    overflow: hidden;
  }

  .project-description.is-expanded {
    display: block;
    -webkit-line-clamp: unset;
    max-height: none;
  }

  /* Keeps "... Show more" together at the end of the last line: it can
     never wrap onto a line of its own, and the trim routine only accepts a
     cut point where the whole tail still fits alongside the visible text. */
  .project-description-tail {
    white-space: nowrap;
  }

  .project-expand-inline {
    margin-left: 0.3em;
    color: var(--color-accent-bright);
    cursor: pointer;
  }

  .project-expand-inline:hover,
  .project-expand-inline:focus-visible {
    text-decoration: underline;
  }

  .project-expand {
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
    .project,
    .project-link {
      flex-direction: column;
      align-items: stretch;
    }

    .project-content {
      padding-right: 0;
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
    }

    /* Flattens the anchor so its content/meta reorder alongside the
       show-more button, which lives outside the anchor in the markup. */
    .project--expandable {
      display: flex;
      flex-direction: column;
      gap: 0;
      justify-content: flex-start;
    }

    .project-link {
      display: contents;
    }

    .project-content {
      order: 1;
    }

    .project-expand {
      order: 2;
      align-self: center;
    }

    .project-meta {
      order: 3;
    }
  }
</style>

<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { ExpandableText } from '../lib/expandable-text.svelte';
  import { wholeCardLink } from '../lib/whole-card-link';
  import type { PortfolioEntry } from '../lib/portfolio';
  import SkillChips from './SkillChips.svelte';

  interface Props extends PortfolioEntry {
    activeSkills?: readonly string[];
    isDimmed?: boolean;
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
    isDimmed = false,
  }: Props = $props();

  const instanceId = $props.id();
  const descriptionId = `portfolio-item-description-${instanceId}`;
  const titleId = `portfolio-item-title-${instanceId}`;
  const showMoreId = `portfolio-item-show-more-${instanceId}`;
  const showLessId = `portfolio-item-show-less-${instanceId}`;

  const fullHtml = untrack(() => (description ?? '').trim());
  const expandable = new ExpandableText(fullHtml);
  let linkElement = $state<HTMLAnchorElement>();

  onMount(() => expandable.mount());
</script>

<div
  class="item"
  class:is-dimmed={isDimmed}
  class:is-settled={expandable.isIntroComplete}
  {@attach wholeCardLink(() => linkElement)}
>
  <div class="item-row">
    <div class="item-content">
      <a
        class="overlay-link"
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
      {#if expandable.hasContent}
        <div
          class="item-description"
          class:is-expanded={expandable.isExpanded}
          class:is-revealed={expandable.isTextRevealed}
          id={descriptionId}
          style:max-height={expandable.pinnedMaxHeight}
          bind:this={expandable.textElement}
        >
          <div bind:this={expandable.bodyElement}>{@html fullHtml}</div>
        </div>
        <div hidden>
          <span
            class="item-tail"
            class:is-transparent={expandable.isTailTransparent}
            bind:this={expandable.tailElement}
          >
            <span aria-hidden="true">...</span>
            <button
              type="button"
              class="item-show-more"
              id={showMoreId}
              bind:this={expandable.showMoreElement}
              aria-expanded="false"
              aria-controls={descriptionId}
              aria-labelledby="{showMoreId} {titleId}"
              onclick={() => expandable.expand()}
            >
              Show more
            </button>
          </span>
        </div>
      {/if}
    </div>
    <span class="item-meta">{callToAction} &rarr;</span>
  </div>
  {#if expandable.hasContent}
    <button
      type="button"
      class="item-show-less"
      class:is-transparent={expandable.isShowLessTransparent}
      id={showLessId}
      bind:this={expandable.showLessElement}
      aria-expanded={expandable.isExpanded}
      aria-controls={descriptionId}
      aria-labelledby="{showLessId} {titleId}"
      hidden={!expandable.isExpanded || !expandable.isTruncated}
      onclick={() => expandable.collapse()}
    >
      Show less
    </button>
  {/if}
  <div class="item-skills">
    <SkillChips
      {skills}
      {activeSkills}
      isRevealed={expandable.isIntroComplete}
    />
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

  .overlay-link {
    text-decoration: none;
  }

  .overlay-link::after {
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
  .item-meta,
  .item-skills {
    cursor: pointer;
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
    /* Chrome won't start a drag-select inside a link unless this is explicit. */
    user-select: text;
    font-family: var(--font-display);
    color: var(--color-text);
    font-size: 1.05rem;
  }

  .item-meta {
    color: var(--color-accent-bright);
    font-size: 0.9rem;
    white-space: nowrap;
    flex-shrink: 0;
    transition: var(--fade-in);
  }

  .item-description {
    --collapsed-lines: 3;
    margin: 0.4rem 0 0;
    color: var(--color-text-dim);
    font-size: 0.9rem;
    line-height: 1.5;
    max-height: calc(1em * 1.5 * var(--collapsed-lines));
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

  .item-show-more,
  .item-show-less {
    position: relative;
    z-index: 1;
    padding: 0;
    border: none;
    background: none;
    color: var(--color-accent-bright);
    font-family: inherit;
    cursor: pointer;
  }

  .item-show-more:hover,
  .item-show-more:focus-visible,
  .item-show-less:hover,
  .item-show-less:focus-visible {
    text-decoration: underline;
  }

  .item-show-more {
    margin-left: 0.3em;
    font-size: inherit;
  }

  .item-show-less {
    margin-top: 0.4rem;
    font-size: 0.85rem;
    transition: var(--fade-in);
  }

  .item-tail.is-transparent,
  .item-show-less.is-transparent {
    opacity: 0;
  }

  @media (max-width: 480px) {
    .item-row {
      display: contents;
    }

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
  }
</style>

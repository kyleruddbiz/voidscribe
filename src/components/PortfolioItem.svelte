<script lang="ts">
  import { wholeCardLink } from '../lib/whole-card-link';
  import type { PortfolioEntry } from '../lib/portfolio';
  import ExpandableText from './ExpandableText.svelte';
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

  const fullHtml = $derived((description ?? '').trim());
  let isIntroCompleted = $state(false);
  let linkElement = $state<HTMLAnchorElement>();
</script>

<div
  class="item"
  class:is-dimmed={isDimmed}
  class:is-settled={isIntroCompleted}
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
      {#if fullHtml}
        <div class="item-description">
          <ExpandableText
            html={fullHtml}
            id={descriptionId}
            labelledBy={titleId}
            bind:isIntroCompleted
          />
        </div>
      {/if}
    </div>
    <span class="item-meta">{callToAction} &rarr;</span>
  </div>
  <div class="item-skills">
    <SkillChips {skills} {activeSkills} isRevealed={isIntroCompleted} />
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
  }

  :global(.js) .item:not(.is-settled) .item-meta {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .item-meta {
      transition: none;
    }
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

    .item-skills {
      left: 0;
      right: 0;
      --chips-align: center;
    }
  }
</style>

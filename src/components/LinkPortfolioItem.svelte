<script lang="ts">
  import { wholeCardLink } from '../lib/whole-card-link';
  import type { LinkPortfolioEntry, Skill } from '../lib/portfolio';
  import ExpandableText from './ExpandableText.svelte';
  import PortfolioCard from './PortfolioCard.svelte';
  import PortfolioItemHeading from './PortfolioItemHeading.svelte';

  interface Props extends Omit<LinkPortfolioEntry, 'kind'> {
    activeSkills?: Skill[];
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

<PortfolioCard
  {skills}
  {activeSkills}
  {isDimmed}
  isSettled={isIntroCompleted}
  style="--skills-cursor: pointer; --skills-pointer-events: auto"
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
        <PortfolioItemHeading {icon} {title} {titleId} />
      </a>
      {#if fullHtml}
        <div class="item-description">
          <ExpandableText
            html={fullHtml}
            id={descriptionId}
            labelledBy={titleId}
            onIntroCompleted={() => (isIntroCompleted = true)}
          />
        </div>
      {/if}
    </div>
    <span class="item-meta">{callToAction} &rarr;</span>
  </div>
</PortfolioCard>

<style>
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

  .item-description,
  .item-meta {
    position: relative;
    z-index: 1;
    cursor: pointer;
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

  :global(.js) :global(.item:not(.is-settled)) .item-meta {
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

    .item-content {
      padding-right: 0;
      order: 1;
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
  }
</style>

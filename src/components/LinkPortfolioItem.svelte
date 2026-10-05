<script lang="ts">
  import { portfolioPagePath } from '../lib/portfolio-page-path';
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
    preview,
    page,
    activeSkills = [],
    isDimmed = false,
  }: Props = $props();

  const instanceId = $props.id();
  const descriptionId = `portfolio-item-description-${instanceId}`;
  const titleId = `portfolio-item-title-${instanceId}`;

  const linkHref = $derived(page ? portfolioPagePath(page.slug) : href);
  const fullHtml = $derived((description ?? '').trim());
  let isIntroCompleted = $state(false);
  let isExpanded = $state(false);
  let linkElement = $state<HTMLAnchorElement>();
</script>

<PortfolioCard
  {skills}
  {activeSkills}
  {isDimmed}
  isSettled={isIntroCompleted}
  class={preview && 'has-preview'}
  style="--skills-cursor: pointer; --skills-pointer-events: auto; --skills-inset-right: 12rem"
  {@attach wholeCardLink(() => linkElement)}
>
  {#if preview}
    <div class="item-preview" class:is-strip={isExpanded}>
      <img
        src={preview.src}
        srcset={preview.srcset}
        sizes={preview.sizes}
        alt=""
        loading="lazy"
        decoding="async"
      />
    </div>
  {/if}
  <div class="item-row">
    <div class="item-content">
      <a
        class="overlay-link"
        href={linkHref}
        target={page ? undefined : '_blank'}
        rel={page ? undefined : rel}
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
            onExpandedChange={(expanded) => (isExpanded = expanded)}
          />
        </div>
      {/if}
    </div>
    <span class="item-meta">
      {#if page}
        Would you like to know more? &rarr;
      {:else}
        {callToAction} &nearr;
      {/if}
    </span>
  </div>
</PortfolioCard>

<style>
  :global(.item.has-preview) {
    --preview-size: 6rem;
    --banner-height: 10rem;
    --preview-morph: 600ms ease;
    --content-offset: calc(var(--preview-size) + 1rem);
    container-type: inline-size;
  }

  .item-preview {
    position: absolute;
    top: calc(50% - 0.25rem - var(--preview-size) / 2);
    left: var(--card-padding-x);
    width: var(--preview-size);
    height: var(--preview-size);
    overflow: hidden;
    border-radius: 2px;
    transition:
      var(--fade-in),
      top var(--preview-morph),
      left var(--preview-morph),
      width var(--preview-morph),
      height var(--preview-morph),
      border-radius var(--preview-morph);
  }

  .item-preview.is-strip {
    top: 0;
    left: 0;
    width: calc(var(--content-offset) + var(--card-padding-x) - 1.25rem);
    height: 100%;
    border-radius: 3px 0 0 3px;
  }

  .item-preview img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  :global(.js) :global(.item:not(.is-settled)) .item-preview {
    opacity: 0;
  }

  .item-row {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .item-content {
    min-width: 0;
  }

  :global(.has-preview) .item-row {
    min-height: var(--preview-size);
    padding-left: var(--content-offset);
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
    align-self: flex-end;
    margin-right: -0.5rem;
    margin-bottom: -1.25rem;
    transition: var(--fade-in);
  }

  .item-description {
    --collapsed-lines: 3;
    max-width: 56ch;
    margin: 0.4rem 0 0;
    color: var(--color-text-dim);
    font-size: 0.9rem;
  }

  :global(.js) :global(.item:not(.is-settled)) .item-meta {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .item-meta,
    .item-preview {
      transition: none;
    }
  }

  @container (max-width: 30rem) {
    .item-preview,
    .item-preview.is-strip {
      top: 0;
      left: 0;
      width: 100%;
      height: var(--banner-height);
      border-radius: 3px 3px 0 0;
    }

    :global(.has-preview) .item-row {
      min-height: 0;
      padding-top: calc(var(--banner-height) - 1rem + 0.75rem);
      padding-left: 0;
    }
  }

  @media (max-width: 480px) {
    .item-row {
      display: contents;
    }

    .item-content {
      order: 1;
    }

    :global(.has-preview) .item-row {
      padding-top: 0;
    }

    :global(.has-preview) .item-content {
      padding-top: calc(var(--banner-height) - 1rem + 0.75rem);
    }

    .item-description {
      text-align: center;
    }

    .item-meta {
      align-self: stretch;
      margin-top: 0.75rem;
      margin-right: 0;
      margin-bottom: 0;
      text-align: center;
      white-space: normal;
      order: 3;
    }
  }
</style>

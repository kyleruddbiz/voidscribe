<script lang="ts">
  import { onMount } from 'svelte';
  import PhotoSwipeLightbox from 'photoswipe/lightbox';
  import 'photoswipe/style.css';
  import type { GalleryPortfolioEntry, Skill } from '../lib/portfolio';
  import ExpandableText from './ExpandableText.svelte';
  import PortfolioCard from './PortfolioCard.svelte';
  import PortfolioItemHeading from './PortfolioItemHeading.svelte';

  interface Props extends Omit<GalleryPortfolioEntry, 'kind'> {
    activeSkills?: Skill[];
    isDimmed?: boolean;
  }

  let {
    icon,
    description,
    title,
    skills,
    images,
    activeSkills = [],
    isDimmed = false,
  }: Props = $props();

  const instanceId = $props.id();
  const descriptionId = `portfolio-item-description-${instanceId}`;
  const titleId = `portfolio-item-title-${instanceId}`;
  const gridId = `portfolio-item-grid-${instanceId}`;

  const fullHtml = $derived((description ?? '').trim());
  let isIntroCompleted = $state(false);
  let isExpanded = $state(false);
  let isOverflowing = $state(false);
  let wrapperElement: HTMLDivElement;
  let gridElement: HTMLDivElement;
  let gridHeight = $state<number>();

  const measure = () => {
    gridHeight = wrapperElement.scrollHeight;
    isOverflowing = gridHeight > wrapperElement.clientHeight || isExpanded;
  };

  onMount(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: gridElement,
      children: 'a',
      pswpModule: () => import('photoswipe'),
    });
    lightbox.init();

    const observer = new ResizeObserver(measure);
    observer.observe(wrapperElement);
    observer.observe(gridElement);

    return () => {
      observer.disconnect();
      lightbox.destroy();
    };
  });

  const toggle = () => {
    measure();
    isExpanded = !isExpanded;
  };
</script>

<PortfolioCard {skills} {activeSkills} {isDimmed} isSettled={isIntroCompleted}>
  <PortfolioItemHeading {icon} {title} {titleId} />
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
  <div
    class="grid-wrapper"
    class:is-expanded={isExpanded}
    bind:this={wrapperElement}
    style:--expanded-height={gridHeight && `${gridHeight}px`}
  >
    <div
      class="grid"
      id={gridId}
      bind:this={gridElement}
      onfocusin={() => (isExpanded = true)}
    >
      {#each images as image (image.full.src)}
        <a
          class="thumbnail"
          href={image.full.src}
          data-pswp-width={image.full.width}
          data-pswp-height={image.full.height}
          data-cropped="true"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={image.thumbnail.src}
            srcset={image.thumbnail.srcset}
            sizes={image.thumbnail.sizes}
            alt={image.alt}
            loading="lazy"
            decoding="async"
          />
        </a>
      {/each}
    </div>
  </div>
  {#if isOverflowing}
    <div class="toggle-row">
      <button
        type="button"
        class="text-button"
        aria-expanded={isExpanded}
        aria-controls={gridId}
        aria-labelledby="{gridId}-toggle {titleId}"
        id="{gridId}-toggle"
        onclick={toggle}
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  {/if}
</PortfolioCard>

<style>
  :global(.pswp) {
    --pswp-bg: var(--color-bg);
    --pswp-icon-color: var(--color-text);
    --pswp-icon-color-secondary: var(--color-bg);
    --pswp-icon-stroke-color: var(--color-bg);
    --pswp-placeholder-bg: var(--color-bg-raised);
  }

  .item-description {
    --collapsed-lines: 3;
    margin: 0.4rem 0 0;
    color: var(--color-text-dim);
    font-size: 0.9rem;
  }

  .grid-wrapper {
    --collapsed-height: 12rem;
    margin-top: 1rem;
    max-height: var(--collapsed-height);
    overflow: hidden;
    mask-image: linear-gradient(to bottom, #000 60%, transparent);
    transition: max-height 0.35s ease;
  }

  .grid-wrapper.is-expanded {
    max-height: var(--expanded-height, none);
    mask-image: none;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(7.5rem, 1fr));
    gap: 0.75rem;
  }

  .thumbnail {
    display: block;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 2px;
  }

  .thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .toggle-row {
    margin-top: 0.5rem;
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .grid-wrapper {
      transition: none;
    }
  }

  @media (max-width: 480px) {
    .item-description {
      text-align: center;
    }

    .grid {
      grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
    }
  }
</style>

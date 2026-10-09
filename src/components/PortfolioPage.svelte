<script lang="ts">
  import type { LinkPortfolioEntry } from '../lib/portfolio';
  import SkillChips from './SkillChips.svelte';

  interface Props {
    entry: LinkPortfolioEntry;
  }

  const { entry }: Props = $props();
  const {
    icon,
    title,
    skills,
    preview,
    href,
    rel = 'noopener noreferrer',
    callToAction,
  } = $derived(entry);
</script>

<article class="portfolio-page">
  <header class="page-header">
    {#if preview}
      <img
        class="page-preview"
        src={preview.src}
        srcset={preview.srcset}
        sizes="(max-width: 480px) 100vw, 10rem"
        alt=""
        decoding="async"
      />
    {/if}
    <div class="page-heading">
      <h1 class="page-title">{@html title}</h1>
      <SkillChips {skills} />
      <a class="page-cta" {href} target="_blank" {rel}>
        <svg class="page-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d={icon} />
        </svg>
        <span>{callToAction} &nearr;</span>
      </a>
    </div>
  </header>

  <div class="page-body">
    <p>{@html entry.description}</p>
    {@html entry.page?.description}
  </div>
</article>

<style>
  .page-header {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    margin: 0 0 1.25rem;
  }

  .page-preview {
    display: block;
    flex-shrink: 0;
    width: 10rem;
    height: 10rem;
    object-fit: cover;
    border-radius: 2px;
  }

  .page-heading {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    min-width: 0;
  }

  .page-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: normal;
    color: var(--color-text);
  }

  .page-icon {
    width: 1.1rem;
    height: 1.1rem;
    flex-shrink: 0;
    fill: var(--color-text);
  }

  .page-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-accent-bright);
    font-size: 0.9rem;
    text-decoration: none;
  }

  .page-body {
    max-width: var(--measure);
    color: var(--color-text-dim);
    line-height: 1.6;
  }

  @media (max-width: 480px) {
    .page-header {
      flex-direction: column;
      align-items: stretch;
    }

    .page-preview {
      width: 100%;
      height: 10rem;
    }

    .page-heading {
      --chips-align: center;
      --chips-wrap-indent: 0;
      align-items: center;
      text-align: center;
    }

    .page-heading :global(.chips-wrap) {
      align-self: stretch;
    }
  }
</style>

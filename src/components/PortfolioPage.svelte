<script lang="ts">
  import type { LinkPortfolioEntry } from '../lib/portfolio';
  import SkillChips from './SkillChips.svelte';

  interface Props {
    entry: LinkPortfolioEntry;
    backLabel: string;
  }

  const { entry, backLabel }: Props = $props();
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

<main class="portfolio-page">
  <a class="back-link" href="/kyle-rudd">&larr; {backLabel}</a>

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
      <h1 class="page-title">
        <svg class="page-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d={icon} />
        </svg>
        <span>{@html title}</span>
      </h1>
      <SkillChips {skills} />
      <a class="page-cta" {href} target="_blank" {rel}>{callToAction} &nearr;</a
      >
    </div>
  </header>

  <div class="page-body">
    <p>{@html entry.description}</p>
    {@html entry.page?.description}
  </div>
</main>

<style>
  .portfolio-page {
    max-width: 48rem;
    margin: 0 auto;
    padding: 2rem 1rem 4rem;
  }

  .back-link {
    color: var(--color-accent-bright);
    font-size: 0.9rem;
    text-decoration: none;
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    margin: 1.5rem 0 2rem;
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
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: normal;
    color: var(--color-text);
  }

  .page-icon {
    width: 1.5rem;
    height: 1.5rem;
    flex-shrink: 0;
    fill: var(--color-accent);
  }

  .page-cta {
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
      align-items: center;
      text-align: center;
    }

    .page-title {
      justify-content: center;
    }
  }
</style>

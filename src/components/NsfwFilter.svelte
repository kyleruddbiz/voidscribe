<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    isNsfw?: boolean;
    label: string;
    children: Snippet;
  }

  let { isNsfw = false, label, children }: Props = $props();

  let isRevealed = $state(false);
</script>

{#if isNsfw}
  <div class="nsfw-filter">
    <div class="content" class:blurred={!isRevealed} inert={!isRevealed}>
      {@render children()}
    </div>
    {#if !isRevealed}
      <button
        type="button"
        class="cover"
        aria-label="Show NSFW content: {label}"
        onclick={() => (isRevealed = true)}
      >
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
          />
        </svg>
        <span class="word">NSFW</span>
        <span class="hint"></span>
      </button>
    {/if}
  </div>
{:else}
  {@render children()}
{/if}

<style>
  .nsfw-filter {
    position: relative;
    overflow: hidden;
    border-radius: 2px;
  }

  .content.blurred {
    filter: blur(0.5rem);
  }

  .cover {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.15rem;
    padding: 0.25rem;
    border: 0;
    background: color-mix(in srgb, var(--color-bg) 85%, transparent);
    backdrop-filter: blur(1.5rem);
    color: var(--color-text);
    font: inherit;
    text-align: center;
    cursor: pointer;
    opacity: 0.9;
    transition: color 0.2s ease;
  }

  .cover:hover {
    color: var(--color-accent-bright);
  }

  .cover:focus-visible {
    outline: 2px solid var(--color-accent-bright);
    outline-offset: -2px;
  }

  .icon {
    width: 1.75rem;
    height: 1.75rem;
    fill: currentColor;
  }

  .word {
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .hint {
    color: var(--color-text-dim);
    font-size: 0.7rem;
    transition: color 0.2s ease;
  }

  .cover:hover .hint {
    color: var(--color-accent-bright);
  }

  .hint::before {
    content: 'Click to view';
  }

  @media (pointer: coarse) {
    .hint::before {
      content: 'Tap to view';
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cover,
    .hint {
      transition: none;
    }
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import type { LoopingVideo } from '../lib/looping-video';

  type Props = LoopingVideo & {
    class?: string;
    isPaused?: boolean;
    currentTime?: number;
    onPlayRequested?: () => void;
  };

  let {
    alt,
    poster,
    width,
    height,
    sources,
    class: className,
    isPaused = $bindable(true),
    currentTime = $bindable(0),
    onPlayRequested,
  }: Props = $props();

  let isHydrated = $state(false);

  const togglePlayback = () => {
    isPaused = !isPaused;

    if (!isPaused) {
      onPlayRequested?.();
    }
  };

  onMount(() => {
    isHydrated = true;
  });
</script>

<div class="looping-video {className ?? ''}">
  <video
    {poster}
    {width}
    {height}
    muted
    loop
    playsinline
    preload={currentTime > 0 ? 'auto' : 'none'}
    controls={!isHydrated}
    aria-label={alt}
    aria-hidden={isHydrated || undefined}
    bind:paused={isPaused}
    bind:currentTime
  >
    {#each sources as source (source.src)}
      <source src={source.src} type={source.type} />
    {/each}
  </video>

  {#if isHydrated}
    <button
      type="button"
      class:playing={!isPaused}
      aria-pressed={!isPaused}
      aria-label="Play animation: {alt}"
      onclick={togglePlayback}
    >
      <span class="icon icon-play" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
      </span>
      <span class="icon icon-pause" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
      </span>
    </button>
  {/if}
</div>

<style>
  .looping-video {
    position: relative;
  }

  video {
    display: block;
    width: 100%;
    height: auto;
  }

  button {
    position: absolute;
    inset: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
  }

  button:focus-visible {
    outline: 2px solid var(--color-accent-bright);
    outline-offset: -2px;
  }

  svg {
    width: 100%;
    height: 100%;
    fill: currentcolor;
  }

  .icon {
    position: absolute;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: color-mix(in srgb, var(--color-bg) 75%, transparent);
    pointer-events: none;
    translate: -50% -50%;
    transition-property: opacity, top, left, width, height, padding;
    transition-duration: 0.35s;
    transition-timing-function: ease;
  }

  .icon-play {
    top: calc(100% - 1.5rem);
    left: calc(100% - 1.5rem);
    width: 2rem;
    height: 2rem;
    padding: 0.45rem;
  }

  .icon-pause {
    top: 50%;
    left: 50%;
    width: 4.5rem;
    height: 4.5rem;
    padding: 1.1rem;
    opacity: 0;
  }

  button.playing .icon-play {
    opacity: 0;
  }

  @media (hover: hover) {
    button:not(.playing):is(:hover, :focus-visible) .icon-play {
      top: 50%;
      left: 50%;
      width: 4.5rem;
      height: 4.5rem;
      padding: 1.1rem;
    }

    button.playing:is(:hover, :focus-visible) .icon-pause {
      opacity: 0.6;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .icon {
      transition: none;
    }
  }
</style>

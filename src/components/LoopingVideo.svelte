<script lang="ts">
  import { onMount } from 'svelte';
  import type { LoopingVideo } from '../lib/looping-video';

  type Props = LoopingVideo & { class?: string };

  let {
    alt,
    poster,
    width,
    height,
    sources,
    class: className,
  }: Props = $props();

  let video: HTMLVideoElement | undefined = $state();
  let isHydrated = $state(false);
  let isPlaying = $state(false);

  onMount(() => {
    isHydrated = true;
  });

  const toggle = () => {
    if (!video) {
      return;
    }

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };
</script>

<div class="looping-video {className ?? ''}">
  <video
    bind:this={video}
    {poster}
    {width}
    {height}
    muted
    loop
    playsinline
    preload="none"
    controls={!isHydrated}
    aria-label={alt}
    aria-hidden={isHydrated || undefined}
    onplay={() => (isPlaying = true)}
    onpause={() => (isPlaying = false)}
  >
    {#each sources as source (source.src)}
      <source src={source.src} type={source.type} />
    {/each}
  </video>

  {#if isHydrated}
    <button
      type="button"
      class:playing={isPlaying}
      aria-pressed={isPlaying}
      aria-label="Play animation: {alt}"
      onclick={toggle}
    >
      <span class="icon icon-play" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
      </span>
      <span class="icon icon-pause" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
      </span>
      <span class="badge" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
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

  .icon,
  .badge {
    position: absolute;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: color-mix(in srgb, var(--color-bg) 75%, transparent);
    pointer-events: none;
  }

  .icon {
    top: 50%;
    left: 50%;
    width: 4.5rem;
    height: 4.5rem;
    padding: 1.1rem;
    translate: -50% -50%;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .icon-pause {
    opacity: 0;
  }

  .badge {
    right: 0.5rem;
    bottom: 0.5rem;
    width: 2rem;
    height: 2rem;
    padding: 0.45rem;
    display: none;
  }

  button.playing .badge {
    display: none;
  }

  @media (hover: hover) {
    button:not(.playing):is(:hover, :focus-visible) .icon-play {
      opacity: 1;
    }

    button.playing:is(:hover, :focus-visible) .icon-pause {
      opacity: 0.6;
    }
  }

  @media (hover: none) {
    button:not(.playing) .badge {
      display: grid;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .icon {
      transition: none;
    }
  }
</style>

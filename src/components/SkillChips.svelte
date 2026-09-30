<script lang="ts">
  import { untrack } from 'svelte';
  import type { Skill } from '../lib/portfolio';

  interface Props {
    skills: Skill[];
    activeSkills?: Skill[];
    isRevealed?: boolean;
    isWrapped?: boolean;
  }

  const revealStaggerMs = 500;
  const trayInsetX = 14;

  let {
    skills,
    activeSkills = [],
    isRevealed = true,
    isWrapped = $bindable(false),
  }: Props = $props();
  const isFiltering = $derived(activeSkills.length > 0);

  let list: HTMLUListElement | undefined = $state();
  let chips: HTMLLIElement[] = $state([]);
  let wrapIndex = $state(-1);
  let tray = $state({ left: 0, top: 0, width: 0, height: 0 });

  function measure() {
    const rendered = chips.filter(Boolean);
    const first = rendered[0];
    wrapIndex = first
      ? rendered.findIndex((chip) => chip.offsetTop > first.offsetTop)
      : -1;
    isWrapped = wrapIndex >= 0;

    if (!first || wrapIndex < 0) {
      return;
    }

    const wrapped = rendered.slice(wrapIndex);
    const left = Math.min(...wrapped.map((chip) => chip.offsetLeft));
    const right = Math.max(
      ...wrapped.map((chip) => chip.offsetLeft + chip.offsetWidth),
    );
    const rowCenter = (chip: HTMLElement) =>
      chip.offsetTop + chip.offsetHeight / 2;
    const top = rowCenter(first);
    const bottom = Math.max(...wrapped.map(rowCenter));
    tray = {
      left: left - trayInsetX,
      top,
      width: right - left + trayInsetX * 2,
      height: bottom - top,
    };
  }

  $effect(() => {
    if (wrapIndex >= 0) {
      untrack(measure);
    }
  });

  $effect(() => {
    if (!list) {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(list);
    chips.filter(Boolean).forEach((chip) => observer.observe(chip));

    return () => observer.disconnect();
  });
</script>

{#if skills.length > 0}
  <div class="chips-wrap">
    {#if isWrapped}
      <div
        class="tray"
        class:is-hidden={!isRevealed}
        aria-hidden="true"
        style:--reveal-delay={`${wrapIndex * revealStaggerMs}ms`}
        style:left={`${tray.left}px`}
        style:top={`${tray.top}px`}
        style:width={`${tray.width}px`}
        style:height={`${tray.height}px`}
      ></div>
    {/if}
    <ul
      bind:this={list}
      class="chips"
      class:is-filtering={isFiltering}
      aria-label="Skills"
    >
      {#each skills as skill, i (skill)}
        <li
          bind:this={chips[i]}
          class="chip"
          class:is-wrapped={wrapIndex >= 0 && i >= wrapIndex}
          class:is-wrap-start={i === wrapIndex}
          class:is-active={activeSkills.includes(skill)}
          class:is-hidden={!isRevealed}
          style:--reveal-delay={`${i * revealStaggerMs}ms`}
        >
          <span>{skill}</span>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .chips-wrap {
    position: relative;
    isolation: isolate;
  }

  .tray {
    position: absolute;
    z-index: -1;
    box-sizing: border-box;
    border: 1px solid var(--chips-tray-border, var(--color-border));
    border-top: none;
    border-radius: 0 0 4px 4px;
    background: var(--color-bg-raised);
    transition:
      border-color 0.2s ease,
      opacity 1.2s ease var(--reveal-delay, 0s);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    row-gap: 0.5rem;
    justify-content: var(--chips-align, flex-start);
    margin: 0;
    padding: 0;
    list-style: none;
    pointer-events: none;
  }

  .chip {
    position: relative;
    z-index: 1;
    box-sizing: border-box;
    height: var(--chip-height);
    margin-left: 3px;
    padding: 0.02rem 0.7rem;
    transform: skewX(-14deg);
    background: var(--color-accent-bright);
    color: var(--color-bg);
    font-size: 0.8rem;
    font-weight: 600;
    font-variant-caps: all-small-caps;
    letter-spacing: 0.08em;
    line-height: 1.5;
    white-space: nowrap;
    transition:
      background-color 0.2s ease,
      opacity 1.2s ease var(--reveal-delay, 0s);
  }

  .chip:first-child {
    margin-left: 0;
  }

  .chip.is-wrap-start {
    margin-left: var(--chips-wrap-indent, 2.125rem);
  }

  .chip > span {
    display: block;
    transform: skewX(14deg);
  }

  .chips.is-filtering .chip:not(.is-active) {
    background: var(--color-accent);
  }

  :global(.js) .chip.is-hidden,
  :global(.js) .tray.is-hidden {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .chip,
    .tray {
      transition: none;
    }
  }
</style>

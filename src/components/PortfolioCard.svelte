<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Skill } from '../lib/portfolio';
  import SkillChips from './SkillChips.svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    skills: Skill[];
    activeSkills: Skill[];
    isDimmed: boolean;
    isSettled: boolean;
    children: Snippet;
  }

  let { skills, activeSkills, isDimmed, isSettled, children, ...rest }: Props =
    $props();
  let hasWrappedSkills = $state(false);
</script>

<div
  {...rest}
  class="item"
  class:is-dimmed={isDimmed}
  class:is-settled={isSettled}
  class:has-wrapped-skills={hasWrappedSkills}
>
  {@render children()}
  <div class="item-skills">
    <SkillChips
      {skills}
      {activeSkills}
      isRevealed={isSettled}
      bind:isWrapped={hasWrappedSkills}
    />
  </div>
</div>

<style>
  .item {
    --fade-in: opacity 1.2s ease;
    --icon-fill: var(--color-text-dim);
    --chips-tray-border: var(--color-border);
    --card-padding-x: 1.25rem;
    position: relative;
    padding: 1rem var(--card-padding-x) 1.5rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-bg-raised);
    transition:
      opacity 0.25s ease,
      border-color 0.2s ease;
  }

  .item:hover,
  .item:focus-within {
    --icon-fill: var(--color-accent);
    --chips-tray-border: var(--color-accent);
    border-color: var(--color-accent);
  }

  .item.has-wrapped-skills {
    margin-bottom: 1.5rem;
  }

  .item.is-dimmed {
    opacity: 0.45;
  }

  .item.is-dimmed:hover,
  .item.is-dimmed:focus-within {
    opacity: 1;
  }

  .item-skills {
    --chips-wrap-start: var(--card-padding-x);
    position: absolute;
    left: var(--card-padding-x);
    right: var(--card-padding-x);
    top: 100%;
    z-index: 1;
    cursor: var(--skills-cursor, auto);
  }

  @media (max-width: 480px) {
    .item {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .item-skills {
      left: 0;
      right: 0;
      --chips-align: center;
      --chips-wrap-indent: 0;
    }
  }
</style>

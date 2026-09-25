<script lang="ts">
  interface Props {
    skills: readonly string[];
    activeSkills?: readonly string[];
    revealed?: boolean;
  }

  let { skills, activeSkills = [], revealed = true }: Props = $props();
  const filtering = $derived(activeSkills.length > 0);
</script>

{#if skills.length > 0}
  <ul class="chips" class:is-filtering={filtering} aria-label="Skills">
    {#each skills as skill, i (skill)}
      <li
        class="chip"
        class:is-active={activeSkills.includes(skill)}
        class:is-hidden={!revealed}
        style:--reveal-delay={`${i * 500}ms`}
      >
        <span>{skill}</span>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .chips {
    display: flex;
    justify-content: var(--chips-align, flex-start);
    margin: 0;
    padding: 0;
    list-style: none;
    pointer-events: none;
  }

  .chip {
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

  .chip > span {
    display: block;
    transform: skewX(14deg);
  }

  .chips.is-filtering .chip:not(.is-active) {
    background: var(--color-accent);
  }

  :global(.js) .chip.is-hidden {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .chip {
      transition: none;
    }
  }
</style>

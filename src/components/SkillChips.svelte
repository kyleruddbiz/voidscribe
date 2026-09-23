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
  /* Laid out from the start of whatever box the parent gives it; the parent
     sets --chips-align: center to center them in it instead. */
  .chips {
    display: flex;
    justify-content: var(--chips-align, flex-start);
    margin: 0;
    padding: 0;
    list-style: none;
    /* Lets clicks fall through to whatever the parent positions these over. */
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

  /* Counter-skew keeps the label upright. */
  .chip > span {
    display: block;
    transform: skewX(14deg);
  }

  /* While a filter is active, chips outside it recede. */
  .chips.is-filtering .chip:not(.is-active) {
    background: var(--color-accent);
  }

  /* .js-gated so blocked-script visitors get the chips instead of ones
     stuck hidden; transition-delay (set per chip above) staggers the fade. */
  :global(.js) .chip.is-hidden {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .chip {
      transition: none;
    }
  }
</style>

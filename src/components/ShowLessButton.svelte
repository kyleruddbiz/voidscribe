<script lang="ts">
  import type { ExpandableText } from '../lib/expandable-text.svelte';

  interface Props {
    controller: ExpandableText;
    id: string;
    controls: string;
    labelledBy?: string;
  }

  let { controller, id, controls, labelledBy }: Props = $props();
</script>

<button
  type="button"
  class="show-less"
  class:is-transparent={controller.isShowLessTransparent}
  {id}
  bind:this={controller.showLessElement}
  aria-expanded={controller.isExpanded}
  aria-controls={controls}
  aria-labelledby={labelledBy && `${id} ${labelledBy}`}
  hidden={!controller.isShowLessVisible}
  onclick={() => controller.collapse()}
>
  Show less
</button>

<style>
  .show-less {
    position: relative;
    z-index: 1;
    margin-top: 0.4rem;
    padding: 0;
    border: none;
    background: none;
    color: var(--color-accent-bright);
    font-family: inherit;
    font-size: 0.85rem;
    cursor: pointer;
    transition: opacity 1.2s ease;
  }

  .show-less:hover,
  .show-less:focus-visible {
    text-decoration: underline;
  }

  .show-less.is-transparent {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .show-less {
      transition: none;
    }
  }
</style>

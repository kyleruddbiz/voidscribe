<script lang="ts">
  import { onMount } from 'svelte';
  import type { ExpandableText } from '../lib/expandable-text.svelte';

  interface Props {
    controller: ExpandableText;
    html: string;
    id: string;
    labelledBy?: string;
  }

  let { controller, html, id, labelledBy }: Props = $props();

  let container = $state<HTMLDivElement>();
  let tailTemplate = $state<HTMLDivElement>();

  onMount(() => controller.mount(container!, tailTemplate!));
</script>

<div class="expandable" {id} data-pending bind:this={container}>
  <div class="layer">{@html html}</div>
</div>
<div hidden bind:this={tailTemplate}>
  <span class="tail">
    <span aria-hidden="true">...</span>
    <button
      type="button"
      class="show-more"
      id="{id}-show-more"
      aria-expanded="false"
      aria-controls={id}
      aria-labelledby={labelledBy && `${id}-show-more ${labelledBy}`}
    >
      Show more
    </button>
  </span>
</div>

<style>
  .expandable {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    isolation: isolate;
    overflow: hidden;
    line-height: 1.5;
  }

  :global(.js) .expandable[data-pending] {
    height: 0;
  }

  :global(.js) .expandable[data-pending] > :global(.layer) {
    opacity: 0;
  }

  .expandable :global(.layer) {
    grid-area: 1 / 1;
    align-self: start;
    mix-blend-mode: plus-lighter;
  }

  .expandable :global(.layer :where(p, blockquote)) {
    margin: 0;
  }

  .expandable :global(.layer > * + *) {
    margin-top: 0.6em;
  }

  .expandable :global(.layer blockquote) {
    padding-left: 0.75em;
    border-left: 2px solid var(--color-border);
    font-style: italic;
  }

  .expandable :global(.tail) {
    white-space: nowrap;
    font-style: normal;
  }

  .expandable :global(.show-more) {
    position: relative;
    z-index: 1;
    margin-left: 0.3em;
    padding: 0;
    border: none;
    background: none;
    color: var(--color-accent-bright);
    font: inherit;
    cursor: pointer;
  }

  .expandable :global(.show-more:hover),
  .expandable :global(.show-more:focus-visible) {
    text-decoration: underline;
  }
</style>

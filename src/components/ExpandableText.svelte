<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { ExpandableTextController } from '../lib/expandable-text-controller.svelte';

  interface Props {
    html: string;
    id: string;
    labelledBy?: string;
    onIntroCompleted?: () => void;
  }

  let { html, id, labelledBy, onIntroCompleted }: Props = $props();

  const initialHtml = untrack(() => html);

  let container: HTMLDivElement;
  let initialLayer: HTMLDivElement;
  let template: HTMLTemplateElement;
  let controller = $state<ExpandableTextController>();

  $effect(() => controller?.show(html));

  onMount(() => {
    const mounted = new ExpandableTextController(
      container,
      initialLayer,
      template,
      initialHtml,
      onIntroCompleted,
    );
    controller = mounted;

    return () => mounted.destroy();
  });
</script>

<div class="expandable" {id} data-pending bind:this={container}>
  <div class="layer" bind:this={initialLayer}>{@html initialHtml}</div>
</div>
<template bind:this={template}>
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
  <div class="show-less-row">
    <button
      type="button"
      class="show-less"
      id="{id}-show-less"
      aria-expanded="true"
      aria-controls={id}
      aria-labelledby={labelledBy && `${id}-show-less ${labelledBy}`}
    >
      Show less
    </button>
  </div>
</template>

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

  .expandable :global(.show-more),
  .expandable :global(.show-less) {
    position: relative;
    z-index: 1;
    padding: 0;
    border: none;
    background: none;
    color: var(--color-accent-bright);
    font: inherit;
    cursor: pointer;
  }

  .expandable :global(.show-more) {
    margin-left: 0.3em;
  }

  .expandable :global(.show-more:hover),
  .expandable :global(.show-more:focus-visible),
  .expandable :global(.show-less:hover),
  .expandable :global(.show-less:focus-visible) {
    text-decoration: underline;
  }
</style>

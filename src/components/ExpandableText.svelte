<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { ExpandableTextController } from '../lib/expandable-text-controller.svelte';

  interface Props {
    html: string;
    id: string;
    labelledBy?: string;
    onIntroCompleted?: () => void;
    onExpandedChange?: (isExpanded: boolean) => void;
  }

  let { html, id, labelledBy, onIntroCompleted, onExpandedChange }: Props =
    $props();

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
      onExpandedChange,
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
      class="show-more text-button"
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
      class="show-less text-button"
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

  .expandable :global(.layer blockquote footer) {
    margin-top: 0.25em;
    font-size: 0.9em;
    font-style: normal;
  }

  .expandable :global(.tail) {
    white-space: nowrap;
    font-style: normal;
  }

  .expandable :global(.show-more),
  .expandable :global(.show-less) {
    position: relative;
    z-index: 1;
  }

  .expandable :global(.show-more) {
    margin-left: 0.3em;
  }
</style>

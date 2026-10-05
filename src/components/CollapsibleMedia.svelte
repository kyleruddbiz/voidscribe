<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

  interface Props {
    label: string;
    isExpanded?: boolean;
    children: Snippet;
  }

  let { label, isExpanded = $bindable(false), children }: Props = $props();

  const instanceId = $props.id();
  const contentId = `collapsible-media-${instanceId}`;

  let isOverflowing = $state(false);
  let wrapperElement: HTMLDivElement;
  let contentElement: HTMLDivElement;
  let contentHeight = $state<number>();

  const measure = () => {
    contentHeight = contentElement.scrollHeight;
    isOverflowing = contentHeight > wrapperElement.clientHeight || isExpanded;
  };

  onMount(() => {
    const observer = new ResizeObserver(measure);
    observer.observe(wrapperElement);
    observer.observe(contentElement);

    return () => observer.disconnect();
  });

  const toggle = () => {
    measure();
    isExpanded = !isExpanded;
  };
</script>

<div
  class="wrapper"
  class:is-expanded={isExpanded}
  bind:this={wrapperElement}
  style:--expanded-height={contentHeight && `${contentHeight}px`}
>
  <div id={contentId} bind:this={contentElement}>
    {@render children()}
  </div>
</div>
{#if isOverflowing}
  <div class="toggle-row">
    <button
      type="button"
      class="text-button"
      aria-expanded={isExpanded}
      aria-controls={contentId}
      aria-label="{isExpanded ? 'Show less' : 'Show more'}: {label}"
      onclick={toggle}
    >
      {isExpanded ? 'Show less' : 'Show more'}
    </button>
  </div>
{/if}

<style>
  .wrapper {
    --collapsed-height: 15rem;
    transition: max-height 0.35s ease;
  }

  :global(.js) .wrapper {
    max-height: var(--collapsed-height);
    overflow: hidden;
    mask-image: linear-gradient(to bottom, #000 60%, transparent);
  }

  :global(.js) .wrapper.is-expanded {
    max-height: var(--expanded-height, none);
    mask-image: none;
  }

  .toggle-row {
    margin-top: 0.5rem;
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .wrapper {
      transition: none;
    }
  }
</style>

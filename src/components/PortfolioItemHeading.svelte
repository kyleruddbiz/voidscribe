<script lang="ts">
  interface Props {
    icon: string;
    title: string;
    titleId: string;
  }

  let { icon, title, titleId }: Props = $props();
</script>

<span class="item-main">
  <svg class="item-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d={icon} />
  </svg>
  <span class="item-title" id={titleId}>{@html title}</span>
</span>

<style>
  .item-main {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .item-icon {
    width: 1.15rem;
    height: 1.15rem;
    flex-shrink: 0;
    fill: var(--icon-fill);
  }

  .item-title {
    /* Chrome won't start a drag-select inside a link unless this is explicit. */
    user-select: text;
    font-family: var(--font-display);
    color: var(--color-text);
    font-size: 1.05rem;
  }

  @media (max-width: 480px) {
    .item-main {
      justify-content: center;
    }
  }
</style>

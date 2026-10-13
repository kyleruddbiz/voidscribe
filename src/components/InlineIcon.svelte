<script lang="ts">
  interface Props {
    path: string;
  }

  let { path }: Props = $props();
</script>

<span class="icon"
  ><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d={path} />
  </svg></span
>

<style>
  .icon {
    position: relative;
  }

  .icon::before {
    content: '00' / '';
    color: transparent;
  }

  svg {
    position: absolute;
    right: 0;
    top: 50%;
    width: 0.8em;
    height: 0.8em;
    transform: translateY(-50%);
    fill: currentColor;
  }
</style>

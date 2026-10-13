<script lang="ts">
  interface Props {
    path: string;
  }

  let { path }: Props = $props();
</script>

<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d={path} />
</svg>

<style>
  svg {
    display: inline-block;
    width: 0.8em;
    height: 0.8em;
    margin-left: 0.25em;
    vertical-align: -0.05em;
    fill: currentColor;
  }
</style>

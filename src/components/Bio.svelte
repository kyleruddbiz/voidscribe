<script lang="ts">
  import { getSelectedRoles } from '../lib/selected-roles.svelte';
  import type { Role } from '../lib/portfolio';
  import LoopingVideo from './LoopingVideo.svelte';
  import ExpandableText from './ExpandableText.svelte';

  interface Props {
    bio: string;
    roles: Role[];
  }

  let { bio, roles }: Props = $props();
  const selectedRoles = getSelectedRoles();

  const instanceId = $props.id();
  const bioId = `bio-${instanceId}`;

  const currentRole = $derived(
    roles.find((role) => role.name === selectedRoles.names[0]),
  );
  const currentHtml = $derived((currentRole?.bio ?? bio).trim());
</script>

<div class="bio">
  {#if currentRole?.video}
    <LoopingVideo {...currentRole.video} class="bio-video" />
  {/if}
  <ExpandableText html={currentHtml} id={bioId} />
</div>

<style>
  .bio {
    --collapsed-lines: 6;
    max-width: 38rem;
  }

  .bio :global(.bio-video) {
    margin-bottom: 0.75rem;
  }
</style>

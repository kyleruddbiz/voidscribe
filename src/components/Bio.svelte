<script lang="ts">
  import { selectedRoles } from '../lib/selected-roles.svelte';
  import type { Role } from '../lib/portfolio';
  import ExpandableText from './ExpandableText.svelte';

  interface Props {
    bio: string;
    roles: readonly Role[];
  }

  let { bio, roles }: Props = $props();

  const instanceId = $props.id();
  const bioId = `bio-${instanceId}`;

  const currentHtml = $derived(
    (
      roles.find((role) => role.name === selectedRoles.names[0])?.bio ?? bio
    ).trim(),
  );
</script>

<div class="bio">
  <ExpandableText html={currentHtml} id={bioId} />
</div>

<style>
  .bio {
    --collapsed-lines: 6;
    max-width: 38rem;
  }
</style>

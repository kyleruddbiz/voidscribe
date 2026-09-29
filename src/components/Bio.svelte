<script lang="ts">
  import { untrack } from 'svelte';
  import { ExpandableText } from '../lib/expandable-text.svelte';
  import { selectedRoles } from '../lib/selected-roles.svelte';
  import type { Role } from '../lib/portfolio';
  import ExpandableTextView from './ExpandableText.svelte';

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

  const expandable = new ExpandableText(untrack(() => currentHtml));

  $effect(() => expandable.show(currentHtml));
</script>

<div class="bio">
  <ExpandableTextView
    controller={expandable}
    html={untrack(() => currentHtml)}
    id={bioId}
  />
</div>

<style>
  .bio {
    --collapsed-lines: 6;
    max-width: var(--measure);
  }
</style>

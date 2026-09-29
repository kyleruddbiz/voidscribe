<script lang="ts">
  import { untrack } from 'svelte';
  import { ExpandableTextController } from '../lib/expandable-text-controller.svelte';
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

  const textController = new ExpandableTextController(
    untrack(() => currentHtml),
  );

  $effect(() => textController.show(currentHtml));
</script>

<div class="bio">
  <ExpandableText
    controller={textController}
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

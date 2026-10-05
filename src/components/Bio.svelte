<script lang="ts">
  import { getSelectedRoles } from '../lib/selected-roles.svelte';
  import type { Role } from '../lib/portfolio';
  import { untrack } from 'svelte';
  import { slide } from 'svelte/transition';
  import { transitionDurationMs } from '../lib/layer-crossfade';
  import CollapsibleMedia from './CollapsibleMedia.svelte';
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

  const mediaStates = $state(
    untrack(() =>
      Object.fromEntries(
        roles
          .filter((role) => role.video)
          .map((role) => [role.name, { isExpanded: false, isPaused: true }]),
      ),
    ),
  );

  const videoTransition = () => ({
    duration: matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 0
      : transitionDurationMs,
  });

  const currentRole = $derived(
    roles.find((role) => role.name === selectedRoles.names[0]),
  );
  const currentHtml = $derived((currentRole?.bio ?? bio).trim());
</script>

<div class="bio">
  {#if currentRole?.video}
    {@const mediaState = mediaStates[currentRole.name]}
    <div class="bio-video" transition:slide={videoTransition()}>
      <CollapsibleMedia
        label={currentRole.video.alt}
        bind:isExpanded={mediaState.isExpanded}
        onCollapse={() => (mediaState.isPaused = true)}
      >
        <LoopingVideo
          {...currentRole.video}
          bind:isPaused={mediaState.isPaused}
          onPlayRequested={() => (mediaState.isExpanded = true)}
        />
      </CollapsibleMedia>
    </div>
  {/if}
  <ExpandableText html={currentHtml} id={bioId} />
</div>

<style>
  .bio {
    --collapsed-lines: 6;
    max-width: 38rem;
  }

  .bio-video {
    margin-bottom: 0.75rem;
  }
</style>

<script lang="ts">
  import { flip } from 'svelte/animate';
  import { cubicOut } from 'svelte/easing';
  import { MediaQuery } from 'svelte/reactivity';
  import LinkPortfolioItem from './LinkPortfolioItem.svelte';
  import GalleryPortfolioItem from './GalleryPortfolioItem.svelte';
  import { getSelectedRoles } from '../lib/selected-roles.svelte';
  import type { PortfolioEntry, Role } from '../lib/portfolio';

  interface Props {
    items: PortfolioEntry[];
    roles: Role[];
  }

  let { items, roles }: Props = $props();
  const selectedRoles = getSelectedRoles();

  const activeSkills = $derived([
    ...new Set(
      roles
        .filter((role) => selectedRoles.has(role.name))
        .flatMap((role) => role.skills),
    ),
  ]);
  const isFiltering = $derived(activeSkills.length > 0);

  const matchesFilter = (item: PortfolioEntry) =>
    item.skills.some((skill) => activeSkills.includes(skill));

  const orderedItems = $derived(
    isFiltering
      ? [
          ...items.filter(matchesFilter),
          ...items.filter((item) => !matchesFilter(item)),
        ]
      : items,
  );

  const firstDimmedItem = $derived(
    isFiltering ? items.find((item) => !matchesFilter(item)) : undefined,
  );

  const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce', false);
  const flipDuration = $derived(
    !reducedMotion.current && selectedRoles.isSettled ? 320 : 0,
  );
</script>

<div class="portfolio-list">
  {#each orderedItems as item (item.title)}
    <div
      class="portfolio-card"
      class:starts-dimmed-group={item === firstDimmedItem}
      animate:flip={{ duration: flipDuration, easing: cubicOut }}
    >
      {#if item.kind === 'gallery'}
        <GalleryPortfolioItem
          {...item}
          {activeSkills}
          isDimmed={isFiltering && !matchesFilter(item)}
        />
      {:else}
        <LinkPortfolioItem
          {...item}
          {activeSkills}
          isDimmed={isFiltering && !matchesFilter(item)}
        />
      {/if}
    </div>
  {/each}
</div>

<style>
  .portfolio-list {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .portfolio-card {
    transition: margin-top 0.25s ease;
  }

  .portfolio-card.starts-dimmed-group {
    margin-top: 1.25rem;
  }
</style>

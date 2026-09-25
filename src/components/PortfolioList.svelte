<script lang="ts">
  import { flip } from 'svelte/animate';
  import { cubicOut } from 'svelte/easing';
  import { onMount } from 'svelte';
  import PortfolioItem from './PortfolioItem.svelte';
  import { selectedRoles } from '../lib/selected-roles.svelte';
  import type { PortfolioEntry, Role } from '../lib/portfolio';

  interface Props {
    items: readonly PortfolioEntry[];
    roles: readonly Role[];
  }

  let { items, roles }: Props = $props();

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

  let flipDuration = $state(320);
  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      flipDuration = 0;
    }
  });
</script>

<div class="portfolio-list">
  {#each orderedItems as item (item.title)}
    <div
      class="portfolio-card"
      animate:flip={{ duration: flipDuration, easing: cubicOut }}
    >
      <PortfolioItem
        {...item}
        {activeSkills}
        isDimmed={isFiltering && !matchesFilter(item)}
      />
    </div>
  {/each}
</div>

<style>
  .portfolio-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
</style>

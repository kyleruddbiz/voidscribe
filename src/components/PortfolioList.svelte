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
  const filtering = $derived(activeSkills.length > 0);

  const matches = (item: PortfolioEntry) =>
    item.skills.some((skill) => activeSkills.includes(skill));

  const ordered = $derived(
    filtering
      ? [
          ...items.filter((item) => matches(item)),
          ...items.filter((item) => !matches(item)),
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
  {#each ordered as item (item.title)}
    <div
      class="portfolio-card"
      animate:flip={{ duration: flipDuration, easing: cubicOut }}
    >
      <PortfolioItem
        {...item}
        {activeSkills}
        dimmed={filtering && !matches(item)}
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

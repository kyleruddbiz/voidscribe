<script lang="ts">
  import { flip } from 'svelte/animate';
  import { cubicOut } from 'svelte/easing';
  import { onMount } from 'svelte';
  import PortfolioItem from './PortfolioItem.svelte';
  import { skillFilter } from '../lib/skill-filter.svelte';

  interface Item {
    href: string;
    rel?: string;
    callToAction: string;
    icon: string;
    description?: string;
    title: string;
    skills: readonly string[];
  }

  interface Role {
    name: string;
    skills: readonly string[];
  }

  interface Props {
    items: readonly Item[];
    roles: readonly Role[];
  }

  let { items, roles }: Props = $props();

  // Skills carried by any selected role. Empty when nothing is selected.
  const activeSkills = $derived([
    ...new Set(
      roles
        .filter((role) => skillFilter.isSelected(role.name))
        .flatMap((role) => role.skills),
    ),
  ]);
  const filtering = $derived(activeSkills.length > 0);

  const matches = (item: Item) =>
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
  // Checked in onMount, not at module scope: matchMedia isn't available
  // while Astro server-renders this island.
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

<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { Profile } from '../lib/portfolio';
  import {
    SelectedRoles,
    setSelectedRoles,
  } from '../lib/selected-roles.svelte';
  import Bio from './Bio.svelte';
  import PortfolioList from './PortfolioList.svelte';
  import RoleFilter from './RoleFilter.svelte';

  interface Props {
    profile: Profile;
  }

  let { profile }: Props = $props();

  const selectedRoles = new SelectedRoles();
  setSelectedRoles(selectedRoles);

  onMount(async () => {
    selectedRoles.applyFromUrl(profile.roles);
    await tick();
    selectedRoles.isSettled = true;
  });
</script>

<section class="profile">
  <h1>{profile.name}</h1>
  <RoleFilter roles={profile.roles} />

  <Bio bio={profile.bio} roles={profile.roles} />

  <section class="portfolio">
    <h2>Portfolio</h2>
    <PortfolioList items={profile.portfolio} roles={profile.roles} />
  </section>
</section>

<style>
  h1 {
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    margin: 0 0 0.25rem;
  }

  .portfolio {
    margin-top: 3rem;
  }

  h2 {
    font-size: 1.25rem;
    margin: 0 0 1rem;
  }
</style>

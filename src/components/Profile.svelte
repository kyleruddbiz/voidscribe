<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { Profile } from '../lib/portfolio';
  import {
    SelectedRoles,
    setSelectedRoles,
  } from '../lib/selected-roles.svelte';
  import Bio from './Bio.svelte';
  import PortfolioList from './PortfolioList.svelte';
  import ProfilePhoto from './ProfilePhoto.svelte';
  import RoleFilter from './RoleFilter.svelte';

  interface Props {
    profile: Profile;
  }

  let { profile }: Props = $props();

  const selectedRoles = new SelectedRoles();
  setSelectedRoles(selectedRoles);

  onMount(async () => {
    selectedRoles.applyFromUrl(profile.roles, profile.defaultRole);
    await tick();
    selectedRoles.isSettled = true;
    document.documentElement.classList.remove('role-pending');
  });
</script>

<section class="profile">
  <header class="identity">
    <ProfilePhoto photo={profile.photo} />
    <h1>{profile.name}</h1>
  </header>
  <RoleFilter roles={profile.roles} />

  <Bio bio={profile.bio} roles={profile.roles} />

  <section class="portfolio">
    <h2>Portfolio</h2>
    <PortfolioList items={profile.portfolio} roles={profile.roles} />
  </section>
</section>

<style>
  :global(.role-pending) .profile {
    visibility: hidden;
    animation: reveal-fallback 0s 2s forwards;
  }

  @keyframes reveal-fallback {
    to {
      visibility: visible;
    }
  }

  .identity {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.25rem;
  }

  h1 {
    font-size: clamp(1.75rem, 9vw, 3rem);
    margin: 0;
  }

  .portfolio {
    margin-top: 3rem;
  }

  h2 {
    font-size: 1.25rem;
    margin: 0 0 1rem;
  }
</style>

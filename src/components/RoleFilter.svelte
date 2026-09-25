<script lang="ts">
  import { hasTextSelection } from '../lib/selection';
  import { selectedRoles } from '../lib/selected-roles.svelte';
  import type { Role } from '../lib/portfolio';

  interface Props {
    roles: readonly Role[];
  }

  let { roles }: Props = $props();
  const primary = $derived(roles[0]);
  const rest = $derived(roles.slice(1));

  const letterStaggerMs = 20;
  const lettersLeftWhenNextRoleStarts = 2;

  const startOffsetMs = (role: Role) =>
    (role.name.length - lettersLeftWhenNextRoleStarts) * letterStaggerMs;

  const roleDelays = $derived(
    roles.map((_, i) =>
      roles.slice(0, i).reduce((total, role) => total + startOffsetMs(role), 0),
    ),
  );

  const onClick = (name: string) => {
    if (hasTextSelection()) return;
    selectedRoles.toggle(name);
  };

  const onKeydown = (event: KeyboardEvent, name: string) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectedRoles.toggle(name);
  };
</script>

{#snippet toggle(role: Role, isPrimary: boolean, delay: number)}
  <!-- Spans, not <button>s: Chrome won't start a text selection inside a button. -->
  <span
    class="role-toggle"
    class:is-primary={isPrimary}
    class:is-selected={selectedRoles.has(role.name)}
    style="--role-delay: {delay}ms"
    role="button"
    tabindex="0"
    aria-pressed={selectedRoles.has(role.name)}
    aria-label={role.name}
    onclick={() => onClick(role.name)}
    onkeydown={(event) => onKeydown(event, role.name)}
    >{#each [...role.name] as letter, i}<span
        class="role-letter"
        aria-hidden="true"
        style="animation-delay: calc(var(--role-delay) + {i *
          letterStaggerMs}ms)">{letter}</span
      >{/each}</span
  >
{/snippet}

<p class="role" role="group" aria-label="Filter portfolio by skill">
  {@render toggle(primary, true, roleDelays[0])}
  <span class="secondary-roles">
    {#each rest as role, i (role.name)}
      {@render toggle(role, false, roleDelays[i + 1])}
    {/each}
  </span>
</p>

<style>
  .role {
    --role-hint-duration: 1.4s;
    --role-separator-width: 1.119rem;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    overflow-x: clip;
    color: var(--color-text-dim);
    font-size: 1.1em;
    font-variant-caps: all-small-caps;
    letter-spacing: 0.08em;
    margin: 0 0 2rem;
  }

  .secondary-roles {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
  }

  .role-toggle {
    white-space: nowrap;
    cursor: pointer;
    user-select: text;
    text-decoration: underline;
    text-decoration-color: transparent;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
    transition:
      color 0.15s ease,
      text-decoration-color 0.15s ease,
      text-decoration-thickness 0.15s ease;
    animation: role-hint var(--role-hint-duration) ease-in-out;
    animation-delay: var(--role-delay);
  }

  @keyframes role-hint {
    0%,
    100% {
      text-decoration-color: transparent;
    }
    40% {
      text-decoration-color: var(--color-accent);
    }
  }

  .role-letter {
    animation: letter-hint var(--role-hint-duration) ease-in-out;
  }

  @keyframes letter-hint {
    0%,
    100% {
      color: var(--color-text-dim);
    }
    40% {
      color: var(--color-text);
    }
  }

  .role-toggle.is-primary {
    font-weight: 600;
    font-size: 1.1em;
  }

  .role-toggle:hover,
  .role-toggle:focus-visible {
    color: var(--color-text);
    text-decoration-color: var(--color-accent-bright);
  }

  .role-toggle.is-selected {
    color: var(--color-text);
    text-decoration-color: var(--color-accent-bright);
    text-decoration-thickness: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .role-toggle,
    .role-letter {
      animation: none;
    }
  }

  /* Each role carries its own leading separator, drawn in the previous role's
     trailing margin. At the start of a wrapped line it hangs outside .role and
     is clipped by overflow-x. */
  .secondary-roles .role-toggle::before {
    content: '·';
    display: inline-block;
    box-sizing: border-box;
    width: var(--role-separator-width);
    padding-left: 0.4em;
    margin-left: calc(-1 * var(--role-separator-width));
    color: var(--color-text-dim);
    text-decoration: none;
  }

  .role-toggle:not(:last-child) {
    margin-right: var(--role-separator-width);
  }

  @media (scripting: none) {
    .role-toggle {
      cursor: auto;
      text-decoration: none;
    }
  }
</style>

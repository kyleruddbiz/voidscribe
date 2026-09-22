<script lang="ts">
  import { isSelecting } from '../lib/selection';
  import { skillFilter } from '../lib/skill-filter.svelte';

  interface Props {
    roles: readonly { name: string }[];
  }

  let { roles }: Props = $props();

  // A drag-select ends in a click; don't treat it as a toggle.
  const onClick = (name: string) => {
    if (isSelecting()) return;
    skillFilter.toggle(name);
  };

  const onKeydown = (event: KeyboardEvent, name: string) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    // Space would otherwise scroll the page.
    event.preventDefault();
    skillFilter.toggle(name);
  };
</script>

<!-- Spans, not <button>s: Chrome won't start a text selection inside a button,
     and the role text needs to stay selectable. -->
<p class="role" role="group" aria-label="Filter portfolio by skill">
  {#each roles as role, index (role.name)}
    <span
      class="role-toggle"
      class:is-primary={index === 0}
      class:is-selected={skillFilter.isSelected(role.name)}
      role="button"
      tabindex="0"
      aria-pressed={skillFilter.isSelected(role.name)}
      onclick={() => onClick(role.name)}
      onkeydown={(event) => onKeydown(event, role.name)}>{role.name}</span
    >{' '}
  {/each}
</p>

<style>
  .role {
    color: var(--color-text-dim);
    font-size: 1.1em;
    font-variant-caps: all-small-caps;
    letter-spacing: 0.08em;
    margin: 0 0 2rem;
  }

  .role-toggle {
    white-space: nowrap;
    cursor: pointer;
    user-select: text;
    text-decoration: none;
    text-decoration-color: var(--color-accent-bright);
    text-underline-offset: 0.2em;
    transition:
      color 0.15s ease,
      text-decoration-color 0.15s ease;
  }

  .role-toggle.is-primary {
    font-weight: 600;
    font-size: 1.1em;
  }

  .role-toggle:hover,
  .role-toggle:focus-visible {
    color: var(--color-text);
    text-decoration: underline;
    text-decoration-thickness: 1px;
  }

  .role-toggle.is-selected {
    color: var(--color-text);
    text-decoration: underline;
    text-decoration-thickness: 2px;
  }

  /* Separator trails each role so a wrap never starts a line with a dot.
     inline-block keeps the underline from running under it, which also
     strips a leading space, hence the margin. */
  .role-toggle:not(:last-child)::after {
    content: '·';
    display: inline-block;
    margin-left: 0.4em;
    color: var(--color-text-dim);
    text-decoration: none;
  }

  /* Without JS nothing can be toggled, so don't look clickable. */
  @media (scripting: none) {
    .role-toggle {
      cursor: auto;
      text-decoration: none;
    }
  }

  /* Too narrow for one line: put the primary role alone on its own line
     (no separator needed), with the other two together below it. */
  @media (max-width: 36rem) {
    .role .role-toggle.is-primary {
      display: block;
      width: fit-content;
    }

    /* Must match the separator rule's selector shape to out-rank it. */
    .role .role-toggle.is-primary:not(:last-child)::after {
      content: none;
    }
  }

  /* Too narrow for the other two to share a line: stack all three, no dots. */
  @media (max-width: 22rem) {
    .role .role-toggle {
      display: block;
      width: fit-content;
    }

    .role .role-toggle:not(:last-child)::after {
      content: none;
    }
  }
</style>

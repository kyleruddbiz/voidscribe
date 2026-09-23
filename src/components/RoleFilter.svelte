<script lang="ts">
  import { isSelecting } from '../lib/selection';
  import { skillFilter } from '../lib/skill-filter.svelte';

  interface Props {
    roles: readonly { name: string }[];
  }

  let { roles }: Props = $props();
  const primary = $derived(roles[0]);
  const rest = $derived(roles.slice(1));

  const letterStagger = 20;

  // A role's first letter peaks at the same instant as the previous role's
  // second-to-last letter, so the light carries over with no dead gap.
  const roleDelays = $derived(
    roles.reduce<number[]>((delays, role, i) => {
      if (i === 0) {
        delays.push(0);
      } else {
        const prev = roles[i - 1];
        delays.push(delays[i - 1] + (prev.name.length - 2) * letterStagger);
      }
      return delays;
    }, []),
  );

  const onClick = (name: string) => {
    if (isSelecting()) return;
    skillFilter.toggle(name);
  };

  const onKeydown = (event: KeyboardEvent, name: string) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    skillFilter.toggle(name);
  };
</script>

{#snippet toggle(role: { name: string }, isPrimary: boolean, delay: number)}
  <!-- Spans, not <button>s: Chrome won't start a text selection inside a
       button, and the role text needs to stay selectable. Each letter gets
       its own span so the load-in sweep can light them up in sequence;
       aria-label restores a clean name over the split-up fragments. -->
  <span
    class="role-toggle"
    class:is-primary={isPrimary}
    class:is-selected={skillFilter.isSelected(role.name)}
    style="--role-delay: {delay}ms"
    role="button"
    tabindex="0"
    aria-pressed={skillFilter.isSelected(role.name)}
    aria-label={role.name}
    onclick={() => onClick(role.name)}
    onkeydown={(event) => onKeydown(event, role.name)}
    >{#each [...role.name] as letter, i}<span
        class="role-letter"
        aria-hidden="true"
        style="animation-delay: calc(var(--role-delay) + {i * letterStagger}ms)"
        >{letter}</span
      >{/each}</span
  >
{/snippet}

<!-- Software Engineer stands alone so it can wrap onto its own line first;
     the other two are grouped so they wrap together as a pair, then split
     to one each only once neither fits the line at all. -->
<p class="role" role="group" aria-label="Filter portfolio by skill">
  {@render toggle(primary, true, roleDelays[0])}
  <span class="role-pair">
    {#each rest as role, i (role.name)}
      {@render toggle(role, false, roleDelays[i + 1])}
    {/each}
  </span>
</p>

<style>
  .role {
    --role-hint-duration: 1.4s;
    /* Total advance of a "·" separator (0.4em left margin + glyph + 0.32em
       right margin), fixed in rem so it reads the same regardless of which
       role's font-size it's used against. See the separator comment below
       for how it's used. */
    --role-sep: 1.119rem;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    /* A role that starts a wrapped line pulls its own separator dot fully
       to the left of this box (see below) so it can be cropped off. */
    overflow-x: clip;
    color: var(--color-text-dim);
    font-size: 1.1em;
    font-variant-caps: all-small-caps;
    letter-spacing: 0.08em;
    margin: 0 0 2rem;
  }

  .role-pair {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
  }

  /* The underline is always on but painted transparent at rest, so hover,
     selection and the load-in sweep below only ever animate its color.
     --role-delay (set inline per role) staggers the sweep role by role; the
     letters below read it too, so their own wave picks up where each
     role's starts. */
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

  /* Lights up left to right, on top of the underline sweep. Kept plain
     inline so the space between words renders normally. Same duration as
     the underline sweep above, so the two read as one animation. */
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

  /* Plays once per page load so the affordance is discovered without a
     hover. Reuses the same underline hover/selection use, so it teaches
     the real cue instead of a one-off effect. */
  @keyframes role-hint {
    0%,
    100% {
      text-decoration-color: transparent;
    }
    40% {
      text-decoration-color: var(--color-accent);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .role-toggle,
    .role-letter {
      animation: none;
    }
  }

  /* Every role but the primary carries its OWN separator, glued to its
     start rather than the previous role's end. Mid-line this is invisible:
     the role reserves --role-sep of trailing space (below) for the next
     role's dot, and the dot's own negative margin-left cancels its box's
     width so it paints inside that reserved space with zero footprint of
     its own. At a line start, though, there's no preceding trailing space
     to paint into — the negative margin instead pushes the dot fully past
     this role's left edge, where .role's overflow-x: clip above crops it,
     leaving the role's text flush with the line start. "·" isn't centered
     in its own advance width in this font, so the left padding is larger
     than the trailing gap it leaves, to make the dot look centered in
     --role-sep. */
  .role-pair .role-toggle::before {
    content: '·';
    display: inline-block;
    box-sizing: border-box;
    width: var(--role-sep);
    padding-left: 0.4em;
    margin-left: calc(-1 * var(--role-sep));
    color: var(--color-text-dim);
    text-decoration: none;
  }

  /* Reserves the space the next role's separator dot paints into. */
  .role-toggle:not(:last-child) {
    margin-right: var(--role-sep);
  }

  /* Without JS nothing can be toggled, so don't look clickable. */
  @media (scripting: none) {
    .role-toggle {
      cursor: auto;
      text-decoration: none;
    }
  }
</style>

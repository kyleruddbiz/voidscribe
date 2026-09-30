import { createContext } from 'svelte';
import type { Role } from './portfolio';

const roleParam = 'role';

export const slugFor = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export class SelectedRoles {
  names = $state<string[]>([]);
  isSettled = $state(false);

  has(name: string) {
    return this.names.includes(name);
  }

  toggleExclusive(name: string) {
    this.names = this.has(name) ? [] : [name];
    this.writeUrl();
  }

  toggle(name: string) {
    this.names = this.has(name)
      ? this.names.filter((selected) => selected !== name)
      : [...this.names, name];
    this.writeUrl();
  }

  applyFromUrl(roles: Role[]) {
    const slugs = new URLSearchParams(location.search).getAll(roleParam);
    const known = slugs
      .map((slug) => roles.find((role) => slugFor(role.name) === slug))
      .filter((role) => role !== undefined);

    this.names = known.slice(0, 1).map((role) => role.name);
  }

  private writeUrl() {
    const url = new URL(location.href);
    url.searchParams.delete(roleParam);

    for (const name of this.names) {
      url.searchParams.append(roleParam, slugFor(name));
    }

    history.replaceState(history.state, '', url);
  }
}

export const [getSelectedRoles, setSelectedRoles] =
  createContext<SelectedRoles>();

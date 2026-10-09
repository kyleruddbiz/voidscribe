import { createContext } from 'svelte';
import type { Role, RoleName } from './portfolio';
import { writeRememberedRole } from './remembered-role';

const roleParam = 'role';

export const slugFor = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export class SelectedRoles {
  names = $state<string[]>([]);
  introNames = $state<string[]>([]);
  isSettled = $state(false);

  has(name: string) {
    return this.names.includes(name);
  }

  toggleExclusive(name: string) {
    this.introNames = [];
    this.names = this.has(name) ? [] : [name];
    this.writeUrl();
  }

  toggle(name: string) {
    this.introNames = [];
    this.names = this.has(name)
      ? this.names.filter((selected) => selected !== name)
      : [...this.names, name];
    this.writeUrl();
  }

  applyFromUrl(roles: Role[], defaultRole?: RoleName) {
    const params = new URLSearchParams(location.search);
    const hasRoleParam = params.has(roleParam);
    const fallbackSlugs = defaultRole ? [slugFor(defaultRole)] : [];
    const slugs = hasRoleParam ? params.getAll(roleParam) : fallbackSlugs;
    const known = slugs
      .map((slug) => roles.find((role) => slugFor(role.name) === slug))
      .filter((role) => role !== undefined);

    this.names = known.slice(0, 1).map((role) => role.name);
    this.introNames = this.names;

    if (hasRoleParam) {
      this.remember();
    } else {
      this.writeUrl();
    }
  }

  private remember() {
    writeRememberedRole(this.names[0] && slugFor(this.names[0]));
  }

  private writeUrl() {
    const url = new URL(location.href);
    url.searchParams.delete(roleParam);

    for (const name of this.names) {
      url.searchParams.append(roleParam, slugFor(name));
    }

    history.replaceState(history.state, '', url);
    this.remember();
  }
}

export const [getSelectedRoles, setSelectedRoles] =
  createContext<SelectedRoles>();

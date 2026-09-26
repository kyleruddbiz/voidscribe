class SelectedRoles {
  names = $state<string[]>([]);

  has(name: string) {
    return this.names.includes(name);
  }

  toggleExclusive(name: string) {
    this.names = this.has(name) ? [] : [name];
  }

  toggle(name: string) {
    this.names = this.has(name)
      ? this.names.filter((selected) => selected !== name)
      : [...this.names, name];
  }
}

export const selectedRoles = new SelectedRoles();

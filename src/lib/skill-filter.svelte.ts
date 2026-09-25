class SkillFilter {
  selected = $state<string[]>([]);

  isSelected(role: string) {
    return this.selected.includes(role);
  }

  toggle(role: string) {
    this.selected = this.isSelected(role)
      ? this.selected.filter((name) => name !== role)
      : [...this.selected, role];
  }
}

export const skillFilter = new SkillFilter();

import type { Component } from 'svelte';
import { render } from 'svelte/server';

export function renderToHtml(component: Component): string {
  return render(component).body;
}

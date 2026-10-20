import type { Component } from 'svelte';
import { render } from 'svelte/server';

const hydrationMarkers = /<!--.*?-->/gs;

export function renderToHtml(component: Component): string {
  return render(component).body.replace(hydrationMarkers, '');
}

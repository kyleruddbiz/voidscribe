const transitionDurationMs = 600;
const transitionEasing = 'ease';
const layerClassName = 'layer';

const prefersReducedMotion = () =>
  matchMedia('(prefers-reduced-motion: reduce)').matches;

const fade = (layer: HTMLElement, from: number, to: number) =>
  layer.animate([{ opacity: from }, { opacity: to }], {
    duration: transitionDurationMs,
    easing: transitionEasing,
    fill: 'forwards',
  });

const retireLayer = (layer: HTMLElement) => {
  layer.inert = true;
  for (const element of layer.querySelectorAll('[id]')) {
    element.removeAttribute('id');
  }
};

export class LayerCrossfade {
  private layers: HTMLElement[] = [];
  private animations: Animation[] = [];

  constructor(private readonly container: HTMLElement) {}

  get currentLayer(): HTMLElement | undefined {
    return this.layers.at(-1);
  }

  adopt(layer: HTMLElement) {
    this.layers = [layer];
  }

  /**
   * Fades `render`'s layer in over the existing ones while the container's
   * height animates to fit it. Resolves to false if a later call interrupted
   * this transition.
   */
  async show(render: (layer: HTMLElement) => void): Promise<boolean> {
    const startHeight = this.container.getBoundingClientRect().height;
    const fadingOutLayers = this.layers.map((layer) => ({
      layer,
      startOpacity: parseFloat(getComputedStyle(layer).opacity),
    }));
    this.cancelAnimations();

    for (const { layer } of fadingOutLayers) retireLayer(layer);
    const incomingLayer = document.createElement('div');
    incomingLayer.className = layerClassName;
    this.container.append(incomingLayer);
    this.layers.push(incomingLayer);
    render(incomingLayer);

    if (prefersReducedMotion()) {
      this.removeFadedOutLayers();
      return true;
    }

    const endHeight = incomingLayer.getBoundingClientRect().height;
    this.animations = [
      ...fadingOutLayers.map(({ layer, startOpacity }) =>
        fade(layer, startOpacity, 0),
      ),
      fade(incomingLayer, 0, 1),
      this.container.animate(
        [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
        {
          duration: transitionDurationMs,
          easing: transitionEasing,
          fill: 'forwards',
        },
      ),
    ];

    try {
      await Promise.all(this.animations.map((animation) => animation.finished));
    } catch {
      return false;
    }
    this.removeFadedOutLayers();
    return true;
  }

  private cancelAnimations() {
    for (const animation of this.animations) animation.cancel();
    this.animations = [];
  }

  private removeFadedOutLayers() {
    this.cancelAnimations();
    for (const layer of this.layers.slice(0, -1)) layer.remove();
    this.layers = this.layers.slice(-1);
  }
}

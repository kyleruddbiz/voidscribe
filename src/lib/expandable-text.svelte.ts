import { tick } from 'svelte';
import { createTruncator, type HtmlTruncator } from './truncate-html';

const subpixelTolerance = 1;

const animationsFinished = (element: HTMLElement) =>
  Promise.allSettled(
    element.getAnimations().map((animation) => animation.finished),
  );

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const flushStyles = (element: HTMLElement) => {
  void getComputedStyle(element).opacity;
};

const fadeIn = async (
  element: HTMLElement,
  setTransparent: (transparent: boolean) => void,
) => {
  setTransparent(true);
  await tick();
  flushStyles(element);
  setTransparent(false);
  await tick();
};

export class ExpandableText {
  textElement?: HTMLDivElement;
  bodyElement?: HTMLDivElement;
  tailElement?: HTMLSpanElement;
  showMoreElement?: HTMLButtonElement;
  showLessElement?: HTMLButtonElement;

  expanded = $state(false);
  truncated = $state(false);
  textRevealed = $state(false);
  introComplete = $state(false);
  tailTransparent = $state(false);
  showLessTransparent = $state(false);
  pinnedMaxHeight = $state<string>();

  readonly hasContent: boolean;
  private truncator?: HtmlTruncator;
  private lastWidth = -1;
  private transitioning = false;

  constructor(private readonly fullHtml: string) {
    this.hasContent = fullHtml.length > 0;
  }

  mount() {
    if (!this.hasContent || !this.textElement || !this.tailElement) {
      return;
    }
    this.truncator = createTruncator(this.fullHtml, this.tailElement);

    const observer = new ResizeObserver(() => {
      if (!this.transitioning) this.retruncateIfWidthChanged();
    });
    observer.observe(this.textElement);
    this.revealOnLoad();
    return () => observer.disconnect();
  }

  async expand() {
    if (this.transitioning || this.expanded || !this.textElement) return;
    this.transitioning = true;

    this.showLessTransparent = true;
    await this.animateHeight(
      () => {
        this.bodyElement?.replaceChildren(this.truncator!.full());
        this.expanded = true;
      },
      () => this.textElement!.scrollHeight,
    );

    if (this.showLessElement) {
      await fadeIn(
        this.showLessElement,
        (transparent) => (this.showLessTransparent = transparent),
      );
    }
    this.showLessElement?.focus();
    this.endTransition();
  }

  async collapse() {
    if (
      this.transitioning ||
      !this.expanded ||
      !this.textElement ||
      !this.bodyElement ||
      !this.truncator
    ) {
      return;
    }
    this.transitioning = true;

    const expandedHeight = this.textElement.getBoundingClientRect().height;
    const collapsed = this.measureCollapsed();

    await this.animateHeight(
      () => {
        this.bodyElement!.replaceChildren(this.truncator!.full());
        this.expanded = false;
      },
      () => collapsed.height,
      expandedHeight,
    );

    this.bodyElement.replaceChildren(...collapsed.nodes);
    if (this.tailElement) {
      await fadeIn(
        this.tailElement,
        (transparent) => (this.tailTransparent = transparent),
      );
    }
    this.showMoreElement?.focus();
    this.endTransition();
  }

  private async revealOnLoad() {
    this.transitioning = true;
    this.retruncateIfWidthChanged();

    await this.animateHeight(
      () => (this.textRevealed = true),
      () => this.textElement!.scrollHeight,
    );

    this.introComplete = true;
    this.endTransition();
  }

  private endTransition() {
    this.transitioning = false;
    if (this.textElement) this.retruncateIfWidthChanged();
  }

  private retruncateIfWidthChanged() {
    const width = this.textElement!.getBoundingClientRect().width;
    if (width === this.lastWidth) return;
    this.lastWidth = width;
    this.updateTruncation();
  }

  private updateTruncation() {
    if (!this.textElement || !this.bodyElement || !this.truncator) {
      return;
    }
    const maxHeight = this.collapsedMaxHeight();

    if (!this.expanded) this.bodyElement.replaceChildren(this.truncator.full());
    this.truncated = !this.fitsWithin(maxHeight);
    if (this.truncated && !this.expanded) this.renderTruncated(maxHeight);
  }

  private measureCollapsed() {
    this.renderTruncated(this.collapsedMaxHeight());
    return {
      nodes: [...this.bodyElement!.childNodes],
      height: this.textElement!.scrollHeight,
    };
  }

  private renderTruncated(maxHeight: number) {
    this.truncator!.longestFitting(
      (content) => this.bodyElement!.replaceChildren(content),
      () => this.fitsWithin(maxHeight),
    );
  }

  private fitsWithin(maxHeight: number) {
    return this.textElement!.scrollHeight <= maxHeight + subpixelTolerance;
  }

  private collapsedMaxHeight() {
    const styles = getComputedStyle(this.textElement!);
    const lines = parseInt(styles.getPropertyValue('--collapsed-lines'), 10);
    return parseFloat(styles.lineHeight) * lines;
  }

  private async animateHeight(
    applyChange: () => void,
    targetHeight: () => number,
    startHeight?: number,
  ) {
    const element = this.textElement;
    if (!element) return;
    startHeight ??= element.getBoundingClientRect().height;

    this.pinnedMaxHeight = `${startHeight}px`;
    applyChange();
    await tick();

    await nextFrame();
    this.pinnedMaxHeight = `${targetHeight()}px`;
    await tick();
    await animationsFinished(element);

    this.pinnedMaxHeight = undefined;
  }
}

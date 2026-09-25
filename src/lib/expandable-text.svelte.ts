import { tick } from 'svelte';
import { thirdRoleNearlyDone } from './role-intro';
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

  isExpanded = $state(false);
  isTruncated = $state(false);
  isTextRevealed = $state(false);
  isIntroComplete = $state(false);
  isTailTransparent = $state(false);
  isShowLessTransparent = $state(false);
  pinnedMaxHeight = $state<string>();

  readonly hasContent: boolean;
  private truncator?: HtmlTruncator;
  private lastWidth = -1;
  private isTransitioning = false;

  constructor(private readonly fullHtml: string) {
    this.hasContent = fullHtml.length > 0;
  }

  mount() {
    if (!this.hasContent || !this.textElement || !this.tailElement) {
      return;
    }
    this.truncator = createTruncator(this.fullHtml, this.tailElement);

    const observer = new ResizeObserver(() => {
      if (!this.isTransitioning) this.retruncateIfWidthChanged();
    });
    observer.observe(this.textElement);
    this.revealOnLoad();
    return () => observer.disconnect();
  }

  async expand() {
    if (this.isTransitioning || this.isExpanded || !this.textElement) return;
    this.isTransitioning = true;

    this.isShowLessTransparent = true;
    await this.animateHeight(
      () => {
        this.bodyElement?.replaceChildren(this.truncator!.full());
        this.isExpanded = true;
      },
      () => this.textElement!.scrollHeight,
    );

    if (this.showLessElement) {
      await fadeIn(
        this.showLessElement,
        (transparent) => (this.isShowLessTransparent = transparent),
      );
    }
    this.showLessElement?.focus();
    this.endTransition();
  }

  async collapse() {
    if (
      this.isTransitioning ||
      !this.isExpanded ||
      !this.textElement ||
      !this.bodyElement ||
      !this.truncator
    ) {
      return;
    }
    this.isTransitioning = true;

    const expandedHeight = this.textElement.getBoundingClientRect().height;
    const collapsed = this.measureCollapsed();

    await this.animateHeight(
      () => {
        this.bodyElement!.replaceChildren(this.truncator!.full());
        this.isExpanded = false;
      },
      () => collapsed.height,
      expandedHeight,
    );

    this.bodyElement.replaceChildren(...collapsed.nodes);
    if (this.tailElement) {
      await fadeIn(
        this.tailElement,
        (transparent) => (this.isTailTransparent = transparent),
      );
    }
    this.showMoreElement?.focus();
    this.endTransition();
  }

  private async revealOnLoad() {
    this.isTransitioning = true;
    this.retruncateIfWidthChanged();

    await thirdRoleNearlyDone;
    await this.animateHeight(
      () => (this.isTextRevealed = true),
      () => this.textElement!.scrollHeight,
    );

    this.isIntroComplete = true;
    this.endTransition();
  }

  private endTransition() {
    this.isTransitioning = false;
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

    if (!this.isExpanded) {
      this.bodyElement.replaceChildren(this.truncator.full());
    }
    this.isTruncated = !this.fitsWithin(maxHeight);
    if (this.isTruncated && !this.isExpanded) this.renderTruncated(maxHeight);
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

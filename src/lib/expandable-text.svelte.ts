import { tick } from 'svelte';
import { LayerCrossfade } from './layer-crossfade';
import { createTruncator, type HtmlTruncator } from './truncate-html';

const subpixelTolerance = 1;
const showMoreSelector = '.show-more';
const pendingAttribute = 'data-pending';

interface TextEntry {
  truncator: HtmlTruncator;
  isExpanded: boolean;
}

type FocusTarget = 'show-less' | 'show-more';

const flushStyles = (element: HTMLElement) => {
  void getComputedStyle(element).opacity;
};

export class ExpandableText {
  showLessElement?: HTMLButtonElement;

  isExpanded = $state(false);
  isTruncated = $state(false);
  isShowLessTransparent = $state(false);
  isIntroComplete = $state(false);

  readonly hasContent: boolean;
  private container?: HTMLElement;
  private tailTemplate?: HTMLElement;
  private showMoreId = '';
  private crossfade?: LayerCrossfade;
  private entries = new Map<string, TextEntry>();
  private current?: TextEntry;
  private requestedHtml: string;
  private lastWidth = -1;
  private transitionCount = 0;
  private isTransitioning = false;

  constructor(initialHtml: string) {
    this.hasContent = initialHtml.length > 0;
    this.requestedHtml = initialHtml;
  }

  get isShowLessVisible() {
    return this.isExpanded && this.isTruncated;
  }

  mount(container: HTMLElement, tailTemplate: HTMLElement) {
    this.container = container;
    this.tailTemplate = tailTemplate;
    const showMoreButton = tailTemplate.querySelector(showMoreSelector)!;
    this.showMoreId = showMoreButton.id;
    showMoreButton.removeAttribute('id');

    this.crossfade = new LayerCrossfade(container);
    this.crossfade.adopt(container.firstElementChild as HTMLElement);

    const onClick = (event: MouseEvent) => {
      if ((event.target as Element).closest(showMoreSelector)) this.expand();
    };
    container.addEventListener('click', onClick);

    const observer = new ResizeObserver(() => {
      if (!this.isTransitioning) this.retruncateIfWidthChanged();
    });
    observer.observe(container);

    this.present(this.requestedHtml);
    return () => {
      container.removeEventListener('click', onClick);
      observer.disconnect();
    };
  }

  show(html: string) {
    this.requestedHtml = html;
    if (!this.crossfade) return;
    const entry = this.entryFor(html);
    if (entry !== this.current) this.present(html);
  }

  expand() {
    if (!this.current || this.current.isExpanded) return;
    this.current.isExpanded = true;
    this.present(this.requestedHtml, 'show-less');
  }

  collapse() {
    if (!this.current?.isExpanded) return;
    this.current.isExpanded = false;
    this.present(this.requestedHtml, 'show-more');
  }

  private entryFor(html: string) {
    let entry = this.entries.get(html);
    if (!entry) {
      entry = {
        truncator: createTruncator(html, () => this.createTail()),
        isExpanded: false,
      };
      this.entries.set(html, entry);
    }
    return entry;
  }

  private createTail() {
    const tail = this.tailTemplate!.firstElementChild!.cloneNode(
      true,
    ) as HTMLElement;
    tail.querySelector(showMoreSelector)!.id = this.showMoreId;
    return tail;
  }

  private async present(html: string, focusTarget?: FocusTarget) {
    const entry = this.entryFor(html);
    const transition = ++this.transitionCount;
    const wasShowLessVisible = this.isShowLessVisible;
    this.isTransitioning = true;
    this.lastWidth = this.container!.getBoundingClientRect().width;

    let isTruncated = false;
    const finished = this.crossfade!.show((layer) => {
      this.container!.removeAttribute(pendingAttribute);
      isTruncated = this.renderInto(layer, entry);
    });
    this.current = entry;
    this.isExpanded = entry.isExpanded;
    this.isTruncated = isTruncated;
    if (this.isShowLessVisible && !wasShowLessVisible) {
      this.isShowLessTransparent = true;
    }

    const completed = await finished;
    if (!completed || transition !== this.transitionCount) return;

    if (this.isShowLessVisible && this.showLessElement) {
      await this.fadeInShowLess(this.showLessElement);
    }
    this.moveFocus(focusTarget);
    this.isIntroComplete = true;
    this.isTransitioning = false;
    this.retruncateIfWidthChanged();
  }

  private async fadeInShowLess(element: HTMLElement) {
    this.isShowLessTransparent = true;
    await tick();
    flushStyles(element);
    this.isShowLessTransparent = false;
    await tick();
  }

  private moveFocus(target?: FocusTarget) {
    if (target === 'show-less') {
      this.showLessElement?.focus();
    } else if (target === 'show-more') {
      this.crossfade!.currentLayer?.querySelector<HTMLElement>(
        showMoreSelector,
      )?.focus();
    }
  }

  private retruncateIfWidthChanged() {
    const width = this.container!.getBoundingClientRect().width;
    if (width === this.lastWidth || !this.current) return;
    this.lastWidth = width;
    this.isTruncated = this.renderInto(
      this.crossfade!.currentLayer!,
      this.current,
    );
  }

  private renderInto(layer: HTMLElement, entry: TextEntry) {
    const maxHeight = this.collapsedMaxHeight();
    const fits = () => layer.scrollHeight <= maxHeight + subpixelTolerance;

    layer.replaceChildren(entry.truncator.full());
    const isTruncated = !fits();
    if (isTruncated && !entry.isExpanded) {
      entry.truncator.longestFitting(
        (content) => layer.replaceChildren(content),
        fits,
      );
    }
    return isTruncated;
  }

  private collapsedMaxHeight() {
    const styles = getComputedStyle(this.container!);
    const lines = parseInt(styles.getPropertyValue('--collapsed-lines'), 10);
    return parseFloat(styles.lineHeight) * lines;
  }
}

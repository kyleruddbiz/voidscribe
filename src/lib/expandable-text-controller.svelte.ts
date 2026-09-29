import { LayerCrossfade } from './layer-crossfade';
import { createTruncator, type HtmlTruncator } from './truncate-html';

const subpixelTolerance = 1;
const tailSelector = '.tail';
const showMoreSelector = '.show-more';
const showLessRowSelector = '.show-less-row';
const showLessSelector = '.show-less';
const pendingAttribute = 'data-pending';

interface TextEntry {
  truncator: HtmlTruncator;
  isExpanded: boolean;
}

type FocusTarget = typeof showMoreSelector | typeof showLessSelector;

export class ExpandableText {
  isIntroComplete = $state(false);

  readonly hasContent: boolean;
  private container?: HTMLElement;
  private template?: HTMLElement;
  private showMoreId = '';
  private showLessId = '';
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

  mount(container: HTMLElement, template: HTMLElement) {
    this.container = container;
    this.template = template;
    this.showMoreId = this.takeTemplateId(showMoreSelector);
    this.showLessId = this.takeTemplateId(showLessSelector);

    this.crossfade = new LayerCrossfade(container);
    this.crossfade.adopt(container.firstElementChild as HTMLElement);

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.closest(showMoreSelector)) this.expand();
      else if (target.closest(showLessSelector)) this.collapse();
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
    this.present(this.requestedHtml, showLessSelector);
  }

  collapse() {
    if (!this.current?.isExpanded) return;
    this.current.isExpanded = false;
    this.present(this.requestedHtml, showMoreSelector);
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

  private takeTemplateId(selector: string) {
    const element = this.template!.querySelector(selector)!;
    const id = element.id;
    element.removeAttribute('id');
    return id;
  }

  private cloneFromTemplate(
    containerSelector: string,
    buttonSelector: string,
    buttonId: string,
  ) {
    const clone = this.template!.querySelector(containerSelector)!.cloneNode(
      true,
    ) as HTMLElement;
    const button = clone.matches(buttonSelector)
      ? clone
      : clone.querySelector(buttonSelector)!;
    button.id = buttonId;
    return clone;
  }

  private createTail() {
    return this.cloneFromTemplate(
      tailSelector,
      showMoreSelector,
      this.showMoreId,
    );
  }

  private createShowLessRow() {
    return this.cloneFromTemplate(
      showLessRowSelector,
      showLessSelector,
      this.showLessId,
    );
  }

  private async present(html: string, focusTarget?: FocusTarget) {
    const entry = this.entryFor(html);
    const transition = ++this.transitionCount;
    this.isTransitioning = true;
    this.lastWidth = this.container!.getBoundingClientRect().width;

    const finished = this.crossfade!.show((layer) => {
      this.container!.removeAttribute(pendingAttribute);
      this.renderInto(layer, entry);
    });
    this.current = entry;

    const completed = await finished;
    if (!completed || transition !== this.transitionCount) return;

    this.moveFocus(focusTarget);
    this.isIntroComplete = true;
    this.isTransitioning = false;
    this.retruncateIfWidthChanged();
  }

  private moveFocus(target?: FocusTarget) {
    if (!target) return;
    this.crossfade!.currentLayer?.querySelector<HTMLElement>(target)?.focus();
  }

  private retruncateIfWidthChanged() {
    const width = this.container!.getBoundingClientRect().width;
    if (width === this.lastWidth || !this.current) return;
    this.lastWidth = width;
    this.renderInto(this.crossfade!.currentLayer!, this.current);
  }

  private renderInto(layer: HTMLElement, entry: TextEntry) {
    const maxHeight = this.collapsedMaxHeight();
    const fits = () => layer.scrollHeight <= maxHeight + subpixelTolerance;

    layer.replaceChildren(entry.truncator.full());
    const isTruncated = !fits();
    if (!isTruncated) return;

    if (entry.isExpanded) {
      layer.append(this.createShowLessRow());
    } else {
      entry.truncator.longestFitting(
        (content) => layer.replaceChildren(content),
        fits,
      );
    }
  }

  private collapsedMaxHeight() {
    const styles = getComputedStyle(this.container!);
    const lines = parseInt(styles.getPropertyValue('--collapsed-lines'), 10);
    return parseFloat(styles.lineHeight) * lines;
  }
}

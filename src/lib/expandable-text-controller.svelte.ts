import { LayerCrossfade } from './layer-crossfade';
import { createTruncator, type HtmlTruncator } from './truncate-html';

const subpixelTolerance = 1;
const tailSelector = '.tail';
const showMoreSelector = '.show-more';
const showLessRowSelector = '.show-less-row';
const showLessSelector = '.show-less';
const pendingAttribute = 'data-pending';

interface TextState {
  truncator: HtmlTruncator;
  isExpanded: boolean;
}

type FocusTarget = typeof showMoreSelector | typeof showLessSelector;

export class ExpandableTextController {
  isIntroCompleted = $state(false);

  readonly hasContent: boolean;
  private container?: HTMLElement;
  private template?: HTMLElement;
  private showMoreId = '';
  private showLessId = '';
  private crossfade?: LayerCrossfade;
  private textStates = new Map<string, TextState>();
  private currentTextState?: TextState;
  private requestedHtml: string;
  private lastWidth = -1;
  private latestTransitionId = 0;
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

    this.transitionTo(this.requestedHtml);
    return () => {
      container.removeEventListener('click', onClick);
      observer.disconnect();
    };
  }

  show(html: string) {
    this.requestedHtml = html;
    if (!this.crossfade) return;
    const textState = this.textStateFor(html);
    if (textState !== this.currentTextState) this.transitionTo(html);
  }

  expand() {
    if (!this.currentTextState || this.currentTextState.isExpanded) return;
    this.currentTextState.isExpanded = true;
    this.transitionTo(this.requestedHtml, showLessSelector);
  }

  collapse() {
    if (!this.currentTextState?.isExpanded) return;
    this.currentTextState.isExpanded = false;
    this.transitionTo(this.requestedHtml, showMoreSelector);
  }

  private textStateFor(html: string) {
    let textState = this.textStates.get(html);
    if (!textState) {
      textState = {
        truncator: createTruncator(html, () => this.createTail()),
        isExpanded: false,
      };
      this.textStates.set(html, textState);
    }
    return textState;
  }

  private takeTemplateId(selector: string) {
    const element = this.template!.querySelector(selector)!;
    const id = element.id;
    element.removeAttribute('id');
    return id;
  }

  private cloneFromTemplate(
    clonedElementSelector: string,
    buttonSelector: string,
    buttonId: string,
  ) {
    const clone = this.template!.querySelector(
      clonedElementSelector,
    )!.cloneNode(true) as HTMLElement;
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

  private async transitionTo(html: string, focusTarget?: FocusTarget) {
    const textState = this.textStateFor(html);
    const transitionId = ++this.latestTransitionId;
    const isSuperseded = () => transitionId !== this.latestTransitionId;
    this.isTransitioning = true;
    this.lastWidth = this.container!.getBoundingClientRect().width;

    const wasCompleted = await this.crossfade!.show((layer) => {
      this.container!.removeAttribute(pendingAttribute);
      this.renderInto(layer, textState);
      this.currentTextState = textState;
    });
    if (!wasCompleted || isSuperseded()) return;

    this.moveFocus(focusTarget);
    this.isIntroCompleted = true;
    this.isTransitioning = false;
    this.retruncateIfWidthChanged();
  }

  private moveFocus(target?: FocusTarget) {
    if (!target) return;
    this.crossfade!.currentLayer?.querySelector<HTMLElement>(target)?.focus();
  }

  private retruncateIfWidthChanged() {
    const width = this.container!.getBoundingClientRect().width;
    if (width === this.lastWidth || !this.currentTextState) return;
    this.lastWidth = width;
    this.renderInto(this.crossfade!.currentLayer!, this.currentTextState);
  }

  private renderInto(layer: HTMLElement, textState: TextState) {
    const maxHeight = this.collapsedMaxHeight();
    const fits = () => layer.scrollHeight <= maxHeight + subpixelTolerance;

    layer.replaceChildren(textState.truncator.full());
    const isTruncated = !fits();
    if (!isTruncated) return;

    if (textState.isExpanded) {
      layer.append(this.createShowLessRow());
    } else {
      textState.truncator.longestFitting(
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

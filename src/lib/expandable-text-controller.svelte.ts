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
  private container?: HTMLElement;
  private template?: HTMLTemplateElement;
  private crossfade?: LayerCrossfade;
  private textStates = new Map<string, TextState>();
  private currentTextState?: TextState;
  private requestedHtml: string;
  private lastWidth = -1;
  private latestTransitionId = 0;
  private isTransitioning = false;
  private isIntroCompleted = false;

  constructor(
    initialHtml: string,
    private readonly onIntroCompleted?: () => void,
  ) {
    this.requestedHtml = initialHtml;
  }

  mount(container: HTMLElement, template: HTMLTemplateElement) {
    this.container = container;
    this.template = template;

    this.crossfade = new LayerCrossfade(
      container,
      container.firstElementChild as HTMLElement,
    );

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element;

      if (target.closest(showMoreSelector)) {
        this.expand();
      } else if (target.closest(showLessSelector)) {
        this.collapse();
      }
    };

    container.addEventListener('click', onClick);

    const observer = new ResizeObserver(() => {
      if (!this.isTransitioning) {
        this.retruncateIfWidthChanged();
      }
    });
    observer.observe(container);

    this.transitionTo(this.textStateFor(this.requestedHtml));

    return () => {
      container.removeEventListener('click', onClick);
      observer.disconnect();
    };
  }

  show(html: string) {
    this.requestedHtml = html;

    if (!this.crossfade) {
      return;
    }

    const textState = this.textStateFor(html);

    if (textState !== this.currentTextState) {
      this.transitionTo(textState);
    }
  }

  expand() {
    if (!this.currentTextState || this.currentTextState.isExpanded) {
      return;
    }

    this.currentTextState.isExpanded = true;
    this.transitionTo(this.currentTextState, showLessSelector);
  }

  collapse() {
    if (!this.currentTextState?.isExpanded) {
      return;
    }

    this.currentTextState.isExpanded = false;
    this.transitionTo(this.currentTextState, showMoreSelector);
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

  private clone(selector: string) {
    return this.template!.content.querySelector(selector)!.cloneNode(
      true,
    ) as HTMLElement;
  }

  private createTail() {
    return this.clone(tailSelector);
  }

  private createShowLessRow() {
    return this.clone(showLessRowSelector);
  }

  private async transitionTo(textState: TextState, focusTarget?: FocusTarget) {
    const transitionId = ++this.latestTransitionId;
    const isSuperseded = () => transitionId !== this.latestTransitionId;
    this.isTransitioning = true;
    this.lastWidth = this.container!.getBoundingClientRect().width;

    const wasCompleted = await this.crossfade!.show((layer) => {
      this.container!.removeAttribute(pendingAttribute);
      this.renderInto(layer, textState);
      this.currentTextState = textState;
      this.moveFocus(layer, focusTarget);
    });

    if (!wasCompleted || isSuperseded()) {
      return;
    }

    this.completeIntro();
    this.isTransitioning = false;
    this.retruncateIfWidthChanged();
  }

  private completeIntro() {
    if (this.isIntroCompleted) {
      return;
    }

    this.isIntroCompleted = true;
    this.onIntroCompleted?.();
  }

  private moveFocus(layer: HTMLElement, target?: FocusTarget) {
    if (!target) {
      return;
    }

    layer.querySelector<HTMLElement>(target)?.focus();
  }

  private retruncateIfWidthChanged() {
    const width = this.container!.getBoundingClientRect().width;

    if (width === this.lastWidth || !this.currentTextState) {
      return;
    }

    this.lastWidth = width;
    this.renderInto(this.crossfade!.currentLayer, this.currentTextState);
  }

  private renderInto(layer: HTMLElement, textState: TextState) {
    const maxHeight = this.collapsedMaxHeight();
    const fits = () => layer.scrollHeight <= maxHeight + subpixelTolerance;

    layer.replaceChildren(textState.truncator.full());
    const isTruncated = !fits();

    if (!isTruncated) {
      return;
    }

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

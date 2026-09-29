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

type FocusSelector = typeof showMoreSelector | typeof showLessSelector;

export class ExpandableTextController {
  isIntroComplete = $state(false);

  readonly hasContent: boolean;
  private container?: HTMLElement;
  private buttonTemplate?: HTMLElement;
  private showMoreId = '';
  private showLessId = '';
  private layerCrossfade?: LayerCrossfade;
  private textStates = new Map<string, TextState>();
  private currentText?: TextState;
  private requestedHtml: string;
  private lastRenderedWidth = -1;
  private latestTransitionNumber = 0;
  private isTransitioning = false;

  constructor(initialHtml: string) {
    this.hasContent = initialHtml.length > 0;
    this.requestedHtml = initialHtml;
  }

  mount(container: HTMLElement, buttonTemplate: HTMLElement) {
    this.container = container;
    this.buttonTemplate = buttonTemplate;
    this.showMoreId = this.takeTemplateId(showMoreSelector);
    this.showLessId = this.takeTemplateId(showLessSelector);

    this.layerCrossfade = new LayerCrossfade(container);
    this.layerCrossfade.adopt(container.firstElementChild as HTMLElement);

    const onContainerClick = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.closest(showMoreSelector)) this.expand();
      else if (target.closest(showLessSelector)) this.collapse();
    };
    container.addEventListener('click', onContainerClick);

    const resizeObserver = new ResizeObserver(() => {
      if (!this.isTransitioning) this.retruncateIfWidthChanged();
    });
    resizeObserver.observe(container);

    this.transitionTo(this.requestedHtml);
    return () => {
      container.removeEventListener('click', onContainerClick);
      resizeObserver.disconnect();
    };
  }

  show(html: string) {
    this.requestedHtml = html;
    if (!this.layerCrossfade) return;
    const textState = this.textStateFor(html);
    if (textState !== this.currentText) this.transitionTo(html);
  }

  expand() {
    if (!this.currentText || this.currentText.isExpanded) return;
    this.currentText.isExpanded = true;
    this.transitionTo(this.requestedHtml, showLessSelector);
  }

  collapse() {
    if (!this.currentText?.isExpanded) return;
    this.currentText.isExpanded = false;
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
    const element = this.buttonTemplate!.querySelector(selector)!;
    const id = element.id;
    element.removeAttribute('id');
    return id;
  }

  private cloneFromTemplate(
    clonedElementSelector: string,
    buttonSelector: string,
    buttonId: string,
  ) {
    const clone = this.buttonTemplate!.querySelector(
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

  private async transitionTo(html: string, focusSelector?: FocusSelector) {
    const textState = this.textStateFor(html);
    const transitionNumber = ++this.latestTransitionNumber;
    this.isTransitioning = true;
    this.lastRenderedWidth = this.container!.getBoundingClientRect().width;

    const crossfadeFinished = this.layerCrossfade!.show((layer) => {
      this.container!.removeAttribute(pendingAttribute);
      this.renderInto(layer, textState);
    });
    this.currentText = textState;

    const wasCompleted = await crossfadeFinished;
    if (!wasCompleted || transitionNumber !== this.latestTransitionNumber) {
      return;
    }

    this.moveFocus(focusSelector);
    this.isIntroComplete = true;
    this.isTransitioning = false;
    this.retruncateIfWidthChanged();
  }

  private moveFocus(focusSelector?: FocusSelector) {
    if (!focusSelector) return;
    this.layerCrossfade!.currentLayer?.querySelector<HTMLElement>(
      focusSelector,
    )?.focus();
  }

  private retruncateIfWidthChanged() {
    const currentWidth = this.container!.getBoundingClientRect().width;
    if (currentWidth === this.lastRenderedWidth || !this.currentText) return;
    this.lastRenderedWidth = currentWidth;
    this.renderInto(this.layerCrossfade!.currentLayer!, this.currentText);
  }

  private renderInto(layer: HTMLElement, textState: TextState) {
    const collapsedHeightLimit = this.collapsedMaxHeight();
    const fitsCollapsedHeight = () =>
      layer.scrollHeight <= collapsedHeightLimit + subpixelTolerance;

    layer.replaceChildren(textState.truncator.full());
    const isTruncated = !fitsCollapsedHeight();
    if (!isTruncated) return;

    if (textState.isExpanded) {
      layer.append(this.createShowLessRow());
    } else {
      textState.truncator.longestFitting(
        (content) => layer.replaceChildren(content),
        fitsCollapsedHeight,
      );
    }
  }

  private collapsedMaxHeight() {
    const styles = getComputedStyle(this.container!);
    const collapsedLines = parseInt(
      styles.getPropertyValue('--collapsed-lines'),
      10,
    );
    return parseFloat(styles.lineHeight) * collapsedLines;
  }
}

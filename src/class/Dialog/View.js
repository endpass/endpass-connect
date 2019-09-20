import ConnectError from '@endpass/class/ConnectError';
import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import { inlineStylesState } from '@/util/dom';
import {
  DIRECTION,
  DIALOG_EVENTS,
  PLUGIN_NAMES,
  PLUGIN_METHODS,
} from '@/constants';
import {
  propsIframe,
  propsIframeShow,
  propsIframeHide,
  stylesOverlayShow,
  stylesOverlayHide,
  stylesWrapperShow,
  stylesWrapperHide,
} from './Styles';

export default class DialogView {
  /**
   * @param {object} options
   * @param {string} options.url URL which would be opened in inner iframe element
   * @param {string?} options.namespace Optional namespace for messengers bindings
   * @param {HTMLElement?|string?} [options.element] Render place
   */
  constructor({ url, element, namespace = null }) {
    this.url = url;
    this.namespace = namespace;
    this.element = element;
    this.isElementMode = !!element;

    this.overlay = null;
    this.wrapper = null;
    this.frame = null;
    this.frameStyles = inlineStylesState(propsIframe);
  }

  get rootElement() {
    if (!this.isElementMode) {
      throw new Error('Dialog was inited without target element!');
    }

    if (typeof this.element === 'string') {
      return document.querySelector(this.element);
    }

    return this.element;
  }

  get target() {
    return this.frame.contentWindow;
  }

  hide() {
    this.wrapper.dataset.visible = 'false';
    this.emitEvent(DIALOG_EVENTS.CLOSE);
    this.frame.style = this.frameStyles(propsIframeHide);
    this.wrapper.style = stylesWrapperHide;
  }

  show() {
    this.wrapper.dataset.visible = 'true';
    this.frame.style = this.frameStyles(propsIframeShow);
    this.emitEvent(DIALOG_EVENTS.OPEN);
    this.wrapper.style = stylesWrapperShow;
  }

  onFrameLoad(handler) {
    this.frame.addEventListener('load', handler);
  }

  /**
   * @private
   * @param {string} event
   */
  emitEvent(event) {
    const frameEvent = new CustomEvent(event, {
      detail: {},
    });

    this.overlay.dispatchEvent(frameEvent);
  }

  /**
   * Create default markup for DialogPlugin
   * @private
   * @return {HTMLDivElement}
   */
  createMarkup() {
    const dialogMarkupNS = this.namespace
      ? `data-endpass-namespace="${this.namespace}"`
      : '';
    const markupTemplate = `
      <div
        data-endpass="overlay"
        style="${stylesOverlayHide}"
        ${dialogMarkupNS}
      >
        <div
          data-test="dialog-wrapper"
          data-endpass="wrapper"
          data-visible="false"
          style="${stylesWrapperHide}"
        >
          <iframe
            data-test="dialog-iframe"
            data-endpass="frame" src="${this.url}"
            style="${this.frameStyles(propsIframeHide)}"
          />
        </div>
      </div>
    `;
    const markup = document.createElement('div');

    markup.insertAdjacentHTML('afterBegin', markupTemplate);

    return markup;
  }

  /**
   * Create markup and mount dialog view element to the page body
   * @private
   */
  mount() {
    const markup = this.createMarkup();

    this.overlay = markup.querySelector('[data-endpass="overlay"]');
    this.wrapper = markup.querySelector('[data-endpass="wrapper"]');
    this.frame = markup.querySelector('[data-endpass="frame"]');

    if (this.isElementMode) {
      this.overlay = this.selectHTMLElement();
      this.overlay.appendChild(this.wrapper);
      return;
    }

    this.overlay.addEventListener(DIALOG_EVENTS.OPEN, () => {
      this.overlay.style = stylesOverlayShow;
    });
    this.overlay.addEventListener(DIALOG_EVENTS.CLOSE, () => {
      this.overlay.style = stylesOverlayHide;
    });

    document.body.appendChild(this.overlay);
  }
}

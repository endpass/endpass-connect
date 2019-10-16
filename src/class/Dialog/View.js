import { inlineStylesState } from '@/util/dom';
import { DIALOG_EVENTS } from '@/constants';
import {
  propsIframe,
  propsIframeShow,
  propsIframeHide,
  stylesOverlayShow,
  stylesOverlayHide,
  stylesWrapperShow,
  stylesWrapperHide,
} from './Styles';

const INITIAL_TIMEOUT = 5 * 1000; // 5 seconds

/**
 * @callback Listener {import('@types/global').Listener}
 */

/**
 * @typedef {Object<string, Array<Listener>>} Resolvers
 */

export default class DialogView {
  /**
   * @param {object} options
   * @param {string} options.url URL which would be opened in inner iframe element
   * @param {string?} [options.namespace] Optional namespace for messengers bindings
   * @param {HTMLElement?|string?} [options.element] Render place
   */
  constructor({ url, element, namespace = '' }) {
    this.url = url;
    this.namespace = namespace;
    this.element = element;
    this.isElementMode = !!element;
    this.isReady = false;
    /** @type Resolvers */
    this.readyResolvers = [];
    this.initialTimer = null;

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

  close() {
    if (!this.overlay) {
      return;
    }
    this.hide();

    this.overlay.parentNode.removeChild(this.overlay);
    this.overlay = null;
    this.wrapper = null;
    this.frame = null;
  }

  /**
   *
   * @param {object} params
   * @param {number} params.offsetHeight
   */
  resize({ offsetHeight }) {
    this.frame.style = this.frameStyles({
      'min-height': `${offsetHeight || 0}px`,
    });
  }

  ready() {
    this.isReady = true;
    clearTimeout(this.initialTimer);
    this.readyResolvers.forEach(item => item(true));
    this.readyResolvers.length = 0;
  }

  /**
   *
   * @param {HTMLElement} frame
   * @private
   */
  initFrameCheck(frame) {
    frame.addEventListener('load', () => {
      if (this.isReady) {
        return;
      }
      this.initialTimer = setTimeout(() => {
        // eslint-disable-next-line no-console
        console.error(
          `Dialog View is not initialized, please check auth url ${this.url}`,
        );
      }, INITIAL_TIMEOUT);
    });
  }

  /**
   * Checks dialog ready state
   * Ask messenger before til it give any answer and resolve promise
   * Also, it is caches ready state and in the next time just resolve returned
   * promise
   * @returns {Promise<boolean>}
   */
  waitReady() {
    /* eslint-disable-next-line */
    return new Promise(async resolve => {
      if (this.isReady) {
        return resolve(true);
      }

      this.readyResolvers.push(resolve);
    });
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
   */
  mount() {
    const markup = this.createMarkup();

    this.overlay = markup.querySelector('[data-endpass="overlay"]');
    this.wrapper = markup.querySelector('[data-endpass="wrapper"]');
    this.frame = markup.querySelector('[data-endpass="frame"]');

    this.initFrameCheck(this.frame);

    if (this.isElementMode) {
      this.overlay = this.rootElement;
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

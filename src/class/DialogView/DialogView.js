// @ts-check
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
 * @typedef {Array<{resolve: CallableFunction, reject: CallableFunction}>} Resolvers
 */

export default class DialogView {
  /**
   * @param {object} options
   * @param {string} options.url URL which would be opened in inner iframe element
   * @param {string=} options.namespace Optional namespace for messengers bindings
   * @param {HTMLElement|string=} options.element Render place
   */
  constructor({ url, element, namespace = '' }) {
    this.url = url;
    this.namespace = namespace;
    this.element = element;
    this.isReady = null;
    /** @type {Resolvers} */
    this.readyResolvers = [];

    this.initialTimer = null;

    /** @type {HTMLElement?} */
    this.overlay = null;
    /** @type {HTMLElement?} */
    this.wrapper = null;
    /** @type {HTMLIFrameElement?} */
    this.frame = null;
    this.frameStyles = inlineStylesState(propsIframe);
  }

  /**
   *
   * @private
   * @type {HTMLElement}
   */
  get rootElement() {
    if (!this.element) {
      throw new Error('DialogView was inited without target element!');
    }

    if (typeof this.element !== 'string') {
      return this.element;
    }

    const el = document.querySelector(this.element);
    if (!el) {
      throw new Error('Element is not defined in DOM!');
    }
    return /** @type {HTMLElement} */ (el);
  }

  get isConnected() {
    return this.isReady !== null;
  }

  /**
   *
   * @type {Window|null}
   */
  get target() {
    if (!this.frame) return null;
    return this.frame.contentWindow;
  }

  close() {
    if (!this.wrapper || !this.frame) return;
    this.wrapper.dataset.visible = 'false';
    this.emitEvent(DIALOG_EVENTS.CLOSE);
    this.frame.setAttribute('style', this.frameStyles(propsIframeHide));
    this.wrapper.setAttribute('style', stylesWrapperHide);
  }

  open() {
    if (!this.wrapper || !this.frame) return;
    this.wrapper.dataset.visible = 'true';
    this.frame.setAttribute('style', this.frameStyles(propsIframeShow));
    this.emitEvent(DIALOG_EVENTS.OPEN);
    this.wrapper.setAttribute('style', stylesWrapperShow);
  }

  destroy() {
    if (!this.overlay) {
      return;
    }
    this.setReadyState(false);
    this.releaseResolvers();

    this.close();

    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
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
    if (!this.frame) return;
    this.frame.setAttribute(
      'style',
      this.frameStyles({
        'min-height': `${offsetHeight || 0}px`,
      }),
    );
  }

  handleReady() {
    this.setReadyState(true);
    this.releaseResolvers();
  }

  /**
   *
   * @private
   * @param {boolean} state
   */
  setReadyState(state) {
    if (this.isConnected) return;
    this.isReady = state;
  }

  /**
   * @private
   */
  releaseResolvers() {
    if (this.initialTimer) {
      window.clearTimeout(this.initialTimer);
      this.initialTimer = null;
    }

    this.readyResolvers.forEach(({ resolve, reject }) =>
      this.isReady ? resolve() : reject(),
    );
    this.readyResolvers = [];
  }

  /**
   * @private
   * @param {HTMLElement} frame
   */
  initFrameCheck(frame) {
    frame.addEventListener('load', () => {
      if (this.isConnected) {
        return;
      }
      this.initialTimer = window.setTimeout(() => {
        if (this.isConnected) {
          return;
        }
        this.setReadyState(false);
        this.releaseResolvers();
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
   * @returns {Promise<void>}
   */
  waitReady() {
    return new Promise((resolve, reject) => {
      this.readyResolvers.push({ resolve, reject });
      if (this.isConnected) {
        this.releaseResolvers();
      }
    });
  }

  /**
   * @private
   * @param {string} event
   */
  emitEvent(event) {
    if (!this.overlay) return;

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

    markup.insertAdjacentHTML('afterbegin', markupTemplate);

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

    this.initFrameCheck(/** @type {HTMLIFrameElement} */ (this.frame));

    if (this.element && this.wrapper) {
      this.overlay = this.rootElement;
      this.overlay.appendChild(this.wrapper);
      return;
    }

    if (!this.overlay) return;

    this.overlay.addEventListener(DIALOG_EVENTS.OPEN, () => {
      if (this.overlay) this.overlay.setAttribute('style', stylesOverlayShow);
    });
    this.overlay.addEventListener(DIALOG_EVENTS.CLOSE, () => {
      if (this.overlay) this.overlay.setAttribute('style', stylesOverlayHide);
    });

    document.body.appendChild(this.overlay);
  }
}

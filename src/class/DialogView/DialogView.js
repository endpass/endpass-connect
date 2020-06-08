// @ts-check
import queryStringToMap from '@endpass/utils/queryStringToMap';
import { inlineStylesState } from '@/util/dom';
import { DIALOG_EVENTS } from '@/constants';
import {
  propsIframe,
  propsIframeShow,
  propsIframeHide,
  propsIframeFullScreen,
  stylesOverlayShow,
  stylesOverlayHide,
  stylesWrapperShow,
  stylesWrapperHide,
  stylesWrapperFullScreen,
} from './Styles';
import ConnectError from '@/class/ConnectError';

const INITIAL_TIMEOUT = 5 * 1000; // 5 seconds

const { ERRORS } = ConnectError;

/**
 * @typedef {Array<{resolve: CallableFunction, reject: CallableFunction}>} Resolvers
 */

export default class DialogView {
  /**
   * @param {object} options
   * @param {string=} options.namespace Optional namespace for messengers bindings
   * @param {HTMLElement|string=} options.element Render place
   */
  constructor({ element, namespace = '' }) {
    this.namespace = namespace;
    this.element = element;

    this.isConnectionLoaded = false;
    this.isConnectionInited = false;
    this.isConnectionOpen = false;
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
    this.handleConnectionReady(false);

    this.close();

    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
    this.wrapper = null;
    this.frame = null;
  }

  /**
   * @param {ResizePayload} params
   */
  resize({ offsetHeight, isFullScreen }) {
    if (offsetHeight) {
      this.setMinHeight(offsetHeight);
    }

    if (isFullScreen !== undefined) {
      this.switchFullScreen(isFullScreen);
    }
  }

  /**
   * @param {boolean} isFullScreen
   */
  switchFullScreen(isFullScreen) {
    if (!this.wrapper || !this.frame) return;

    const newStylesWrapper = isFullScreen
      ? stylesWrapperFullScreen
      : stylesWrapperShow;

    const newPropsIframe = isFullScreen
      ? propsIframeFullScreen
      : propsIframeShow;

    this.frame.setAttribute('style', this.frameStyles(newPropsIframe));
    this.wrapper.setAttribute('style', newStylesWrapper);
  }

  /**
   * @param {number} minHeight
   */
  setMinHeight(minHeight = 0) {
    if (!this.frame) return;

    this.frame.setAttribute(
      'style',
      this.frameStyles({
        'min-height': `${minHeight}px`,
      }),
    );
  }

  handleReady() {
    this.handleConnectionReady(true);
  }

  connectionOpen() {
    this.isConnectionOpen = true;
    this.clearTimeout();
  }

  connectionError() {
    this.handleConnectionReady(false);
    this.destroy();
  }

  /**
   * @private
   */
  clearTimeout() {
    if (this.initialTimer) {
      window.clearTimeout(this.initialTimer);
      this.initialTimer = null;
    }
  }

  /**
   * @private
   * @param {boolean} isConnectionInited
   */
  handleConnectionReady(isConnectionInited) {
    this.clearTimeout();
    if (this.isConnectionLoaded) {
      return;
    }

    this.isConnectionLoaded = true;
    this.isConnectionInited = isConnectionInited;

    this.callResolvers();
  }

  /**
   * @private
   */
  callResolvers() {
    this.readyResolvers.forEach(({ resolve, reject }) =>
      this.isConnectionInited
        ? resolve()
        : reject(ConnectError.create(ERRORS.INITIALIZE)),
    );
    this.readyResolvers = [];
  }

  /**
   * @private
   * @param {HTMLIFrameElement} frame
   * @param {string} url
   */
  initFrameCheck(frame, url) {
    frame.addEventListener('load', () => {
      if (this.isConnectionLoaded || this.isConnectionOpen) {
        return;
      }
      this.initTimeoutCheck(url);
    });
  }

  /**
   * @private
   * @param {string} url
   */
  initTimeoutCheck(url) {
    this.clearTimeout();
    this.initialTimer = window.setTimeout(() => {
      if (this.isConnectionLoaded || this.isConnectionOpen) {
        return;
      }
      let params = {};
      try {
        if (!this.frame || !this.frame.contentWindow) {
          throw new Error();
        }
        const replaceReg = /^#\/?/;
        const { location } = this.frame.contentWindow;

        const targetHash = location.hash.replace(replaceReg, '');
        const targetSearch = location.search.replace(replaceReg, '');

        params = queryStringToMap(targetHash || targetSearch);
      } catch (e) {}
      // eslint-disable-next-line no-console
      console.error(
        `Dialog View is not initialized, please check auth url ${url}`,
        params,
      );

      this.handleConnectionReady(false);
    }, INITIAL_TIMEOUT);
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
      if (this.isConnectionLoaded) {
        this.callResolvers();
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
   * @param {string} url
   * @return {HTMLDivElement}
   */
  createMarkup(url) {
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
            data-endpass="frame" src="${url}"
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
   * @param {string} url
   */
  mount(url) {
    const markup = this.createMarkup(url);

    this.overlay = markup.querySelector('[data-endpass="overlay"]');
    this.wrapper = markup.querySelector('[data-endpass="wrapper"]');
    this.frame = markup.querySelector('[data-endpass="frame"]');

    this.initFrameCheck(/** @type {HTMLIFrameElement} */ (this.frame), url);

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

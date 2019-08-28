import ConnectError from '@endpass/class/ConnectError';
import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import { inlineStylesState } from '@/util/dom';
import { DIRECTION, METHODS, DIALOG_EVENTS } from '@/constants';
import {
  propsIframe,
  propsIframeShow,
  propsIframeHide,
  stylesOverlayShow,
  stylesOverlayHide,
  stylesWrapperShow,
  stylesWrapperHide,
} from '@/class/Dialog/DialogStyles';

const { ERRORS } = ConnectError;

const INITIAL_TIMEOUT = 5 * 1000; // 5 seconds

/**
 * @callback Listener {import('@types/global').Listener}
 */

/**
 * @typedef {Object<string, Array<Listener>>} Resolvers
 */

export default class Dialog {
  /**
   * @param {object} options
   * @param {string} options.namespace namespace of connect
   * @param {HTMLElement|string|undefined?} [options.element] render place
   * @param {string} options.url frame url
   */
  constructor({ namespace, element, url }) {
    this.namespace = namespace;
    this.url = url;
    this.ready = false;
    this.element = element;
    this.isElementMode = !!element;

    this.dialogMessenger = new CrossWindowMessenger({
      showLogs: !ENV.isProduction,
      name: `connect-bridge-dialog[]`,
      to: DIRECTION.AUTH,
      from: DIRECTION.CONNECT,
    });
    this.subscribe();

    /** @type Resolvers */
    this.readyResolvers = [];

    // Dialog elements nodes
    this.overlay = null;
    this.wrapper = null;
    this.frame = null;
    this.isShown = false;
    this.initialTimer = null;
    this.frameStyles = inlineStylesState(propsIframe);
    if (document.readyState !== 'complete') {
      document.addEventListener('readystatechange', () => {
        if (document.readyState === 'complete') {
          this.mount();
        }
      });
    } else {
      this.mount();
    }
  }

  /**
   * Subscribe Dialog methods for update style
   */
  subscribe() {
    const messenger = this.dialogMessenger;

    messenger.subscribe(METHODS.READY_STATE_BRIDGE, () => {
      this.ready = true;
      this.readyResolvers.forEach(item => item(true));
      this.readyResolvers.length = 0;
    });

    messenger.subscribe(METHODS.INITIATE, () => {
      clearTimeout(this.initialTimer);
    });
    messenger.subscribe(METHODS.DIALOG_RESIZE, ({ offsetHeight }) => {
      this.frame.style = this.frameStyles({
        'min-height': `${offsetHeight || 0}px`,
      });
    });
    messenger.subscribe(METHODS.DIALOG_CLOSE, () => {
      if (!this.isShown) {
        return;
      }
      this.wrapper.dataset.visible = 'false';
      this.isShown = false;
      this.changeOverlayStyle(DIALOG_EVENTS.CLOSE);
      this.frame.style = this.frameStyles(propsIframeHide);
      this.wrapper.style = stylesWrapperHide;
    });
    messenger.subscribe(METHODS.DIALOG_OPEN, () => {
      if (this.isShown) {
        return;
      }
      this.wrapper.dataset.visible = 'true';
      this.isShown = true;
      this.frame.style = this.frameStyles(propsIframeShow);
      this.changeOverlayStyle(DIALOG_EVENTS.OPEN);
      this.wrapper.style = stylesWrapperShow;
    });
  }

  /**
   * Return instance of Dialog messenger
   * @return {CrossWindowMessenger}
   */
  getDialogMessenger() {
    return this.dialogMessenger;
  }

  /**
   * Change overlay style by event
   * @param event
   */
  changeOverlayStyle(event) {
    if (this.isElementMode) {
      const frameEvent = new CustomEvent(event, {
        detail: {},
      });

      this.overlay.dispatchEvent(frameEvent);
      return;
    }

    switch (event) {
      case DIALOG_EVENTS.OPEN:
        this.overlay.style = stylesOverlayShow;
        break;
      case DIALOG_EVENTS.CLOSE:
      default:
        this.overlay.style = stylesOverlayHide;
        break;
    }
  }

  /**
   * Checks dialog ready state
   * Ask messenger before til it give any answer and resolve promise
   * Also, it is caches ready state and in the next time just resolve returned
   * promise
   * @returns {Promise<boolean>}
   */
  checkReadyState() {
    /* eslint-disable-next-line */
    return new Promise(async resolve => {
      if (this.ready) {
        return resolve(true);
      }

      this.readyResolvers.push(resolve);
    });
  }

  /**
   * Create default markup for Dialog
   * @return {HTMLDivElement}
   */
  createMarkup() {
    const NSmarkup = this.namespace
      ? `data-endpass-namespace="${this.namespace}"`
      : '';

    const markup = `
      <div data-endpass="overlay" ${NSmarkup} style="${stylesOverlayHide}" >
        <div data-test="dialog-wrapper" data-endpass="wrapper" data-visible="false" style="${stylesWrapperHide}">
          <iframe data-test="dialog-iframe" data-endpass="frame" src="${
            this.url
          }" style="${this.frameStyles(propsIframeHide)}"/>
        </div>
      </div>
    `;
    const buffer = document.createElement('div');
    buffer.insertAdjacentHTML('afterBegin', markup);
    return buffer;
  }

  /**
   * Create markup and prepend to <body>
   */
  mount() {
    const buffer = this.createMarkup();

    this.overlay = buffer.querySelector('[data-endpass="overlay"]');
    this.wrapper = buffer.querySelector('[data-endpass="wrapper"]');
    this.frame = buffer.querySelector('[data-endpass="frame"]');

    if (this.isElementMode) {
      const newOverlay = Dialog.getElement(this.element);
      if (!newOverlay) {
        throw new Error(
          'Not defined "element" from options. Please define "element" option as String or HTMLElement',
        );
      }
      newOverlay.appendChild(this.wrapper);
      this.overlay = newOverlay;
    } else {
      document.body.appendChild(this.overlay);
    }

    // subscribe
    this.dialogMessenger.setTarget(this.frame.contentWindow);
    this.frame.addEventListener('load', () => {
      this.initialTimer = setTimeout(() => {
        // eslint-disable-next-line no-console
        console.error(
          `Dialog is not initialized, please check auth url ${this.url}`,
        );
      }, INITIAL_TIMEOUT);
    });
  }

  /**
   * Wrapper on sendMessage and awaitMessage methods
   * Send message with given payload and awaits answer on it
   * @param {string} method Method name
   * @param {object} [payload] Message payload. Must includes method property
   * @returns {Promise<any>} Responded message payload
   */
  async ask(method, payload) {
    if (!method) {
      throw ConnectError.create(ERRORS.BRIDGE_PROVIDE_METHOD);
    }

    await this.checkReadyState();
    const res = await this.dialogMessenger.sendAndWaitResponse(method, payload);

    return res;
  }

  /**
   * Select html element by selector or just return as is
   * @param selector
   * @return {HTMLElement}
   */
  static getElement(selector) {
    if (typeof selector === 'string') {
      return document.querySelector(selector);
    }
    return selector;
  }
}

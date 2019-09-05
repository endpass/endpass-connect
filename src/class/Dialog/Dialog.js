import ConnectError from '@endpass/class/ConnectError';
import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import { inlineStylesState } from '@/util/dom';
import { DIRECTION, DIALOG_EVENTS } from '@/constants';
import {
  propsIframe,
  propsIframeShow,
  propsIframeHide,
  stylesOverlayShow,
  stylesOverlayHide,
  stylesWrapperShow,
  stylesWrapperHide,
} from './DialogStyles';
import StateClose from './states/StateClose';
import dialogHandlers from '@/class/Dialog/dialogHandlers';
import HandlersFactory from '@/class/HandlersFactory';

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
   * @param {object} props
   * @param {string} props.url frame url
   * @param {string?} props.namespace namespace of connect
   * @param {HTMLElement|string?} [props.element] render place
   */
  constructor({ namespace = '', element, url }) {
    this.namespace = namespace;
    this.url = url;
    this.ready = false;
    this.element = element;
    this.isElementMode = !!element;
    this.state = new StateClose(this);

    this.dialogMessenger = new CrossWindowMessenger({
      showLogs: false, //!ENV.isProduction,
      name: `connect-bridge-dialog[]`,
      to: DIRECTION.AUTH,
      from: DIRECTION.CONNECT,
    });

    /** @type Resolvers */
    this.readyResolvers = [];

    // Dialog elements nodes
    this.overlay = null;
    this.wrapper = null;
    this.frame = null;
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
    this.handleEvent = HandlersFactory.createHandleEvent(this, dialogHandlers);
  }

  get subscribeData() {
    return [[this.dialogMessenger]];
  }

  onClose() {
    this.wrapper.dataset.visible = 'false';
    this.emitEvent(DIALOG_EVENTS.CLOSE);
    this.frame.style = this.frameStyles(propsIframeHide);
    this.wrapper.style = stylesWrapperHide;
  }

  onOpen() {
    this.wrapper.dataset.visible = 'true';
    this.frame.style = this.frameStyles(propsIframeShow);
    this.emitEvent(DIALOG_EVENTS.OPEN);
    this.wrapper.style = stylesWrapperShow;
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
   * Return instance of Dialog messenger
   * @public
   * @return {CrossWindowMessenger}
   */
  getDialogMessenger() {
    return this.dialogMessenger;
  }

  /**
   * Checks dialog ready state
   * Ask messenger before til it give any answer and resolve promise
   * Also, it is caches ready state and in the next time just resolve returned
   * promise
   * @private
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
   * @private
   * @return {HTMLDivElement}
   */
  createMarkup() {
    const NSmarkup = this.namespace
      ? `data-endpass-namespace="${this.namespace}"`
      : '';

    const markupTemplate = `
      <div data-endpass="overlay" ${NSmarkup} style="${stylesOverlayHide}" >
        <div data-test="dialog-wrapper" data-endpass="wrapper" data-visible="false" style="${stylesWrapperHide}">
          <iframe data-test="dialog-iframe" data-endpass="frame" src="${
            this.url
          }" style="${this.frameStyles(propsIframeHide)}"/>
        </div>
      </div>
    `;
    const markup = document.createElement('div');
    markup.insertAdjacentHTML('afterBegin', markupTemplate);
    return markup;
  }

  /**
   * Create markup and prepend to <body>
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
    } else {
      this.overlay.addEventListener(DIALOG_EVENTS.OPEN, () => {
        this.overlay.style = stylesOverlayShow;
      });
      this.overlay.addEventListener(DIALOG_EVENTS.CLOSE, () => {
        this.overlay.style = stylesOverlayHide;
      });
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
   * @private
   * @return {HTMLElement}
   */
  selectHTMLElement() {
    const element =
      typeof this.element === 'string'
        ? document.querySelector(this.element)
        : this.element;

    if (!element) {
      throw new Error(
        'Not defined "element" from options. Please define "element" option as String or HTMLElement',
      );
    }
    return element;
  }

  /**
   * Wrapper on sendMessage and awaitMessage methods
   * Send message with given payload and awaits answer on it
   * @public
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
}

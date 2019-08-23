import ConnectError from '@endpass/class/ConnectError';
import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import { inlineStylesState } from '@/util/dom';
import { DIRECTION, METHODS } from '@/constants';
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
   * @param {string} options.url frame url
   */
  constructor({ namespace, url }) {
    this.namespace = namespace;
    this.url = url;
    this.ready = false;

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
      this.wrapper.dataset.visible = 'false';
      this.isShown = false;
      this.overlay.style = stylesOverlayHide;
      this.frame.style = this.frameStyles(propsIframeHide);
      this.wrapper.style = stylesWrapperHide;
    });
    messenger.subscribe(METHODS.DIALOG_OPEN, () => {
      this.wrapper.dataset.visible = 'true';
      this.isShown = true;
      this.frame.style = this.frameStyles(propsIframeShow);
      this.overlay.style = stylesOverlayShow;
      this.wrapper.style = stylesWrapperShow;
    });
  }

  getDialogMessenger() {
    return this.dialogMessenger;
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
   * Create markup and prepend to <body>
   */
  mount() {
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

    document.body.insertAdjacentHTML('afterBegin', markup);

    this.overlay = document.body.querySelector('[data-endpass="overlay"]');
    this.wrapper = document.body.querySelector('[data-endpass="wrapper"]');
    this.frame = document.body.querySelector('[data-endpass="frame"]');

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
}

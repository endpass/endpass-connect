import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import { inlineStyles, inlineStylesState } from '@/util/dom';
import { DIRECTION, METHODS } from '@/constants';

const INITIAL_TIMEOUT = 5 * 1000; // 5 seconds

const propsWrapper = {
  'min-width': '320px',
  'max-width': '442px',
  margin: '50px auto',
};
const stylesWrapperShow = inlineStyles({
  ...propsWrapper,
  transition: 'opacity 0.35s ease-in-out',
  opacity: 1,
});

const stylesWrapperHide = inlineStyles({
  ...propsWrapper,
  opacity: 0,
});

const stylesOverlayShow = inlineStyles({
  position: 'fixed',
  top: '0',
  left: '0',
  'z-index': '6000000',
  width: '100vw',
  height: '100vh',
  'overflow-y': 'auto',
  'background-color': 'rgba(0, 0, 0, 0.6)',
  opacity: 1,
});

const stylesOverlayHide = inlineStyles({
  position: 'absolute',
  top: '-999px',
  left: '-999px',
  width: '0',
  height: '0',
  opacity: 0,
});

const propsIframe = {
  width: '100%',
  height: '100%',
  'box-shadow': '0 5px 10px 1px rgba(0, 0, 0, 0.15)',
  'border-radius': '4px',
  border: 'none',
};

const propsIframeHide = {
  opacity: 0.001,
};

const propsIframeShow = {
  opacity: 1,
};

/**
 * @typedef {Object<string, Array<Listener>>} Resolvers
 */

export default class Dialog {
  /**
   * @param {object} options
   * @param {Context} options.context Context
   * @param {string} options.url Context
   */
  constructor({ context, url }) {
    this.context = context;
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
    this.isInited = false;
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
      this.isInited = true;
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
    const nameSpace = this.context.getNamespace();
    const NSmarkup = nameSpace ? `data-endpass-namespace="${nameSpace}"` : '';

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
      setTimeout(() => {
        if (!this.isInited) {
          /* eslint-disable-next-line */
          console.error(
            `Dialog is not inited, please check auth url ${this.url}`,
          );
        }
      }, INITIAL_TIMEOUT);
    });
  }

  /**
   * Wrapper on sendMessage and awaitMessage methods
   * Send message with given payload and awaits answer on it
   * @param {String} method Method name
   * @param {Object} payload Message payload. Must includes method property
   * @returns {Promise<any>} Responded message payload
   */
  async ask(method, payload) {
    await this.checkReadyState();
    const res = await this.dialogMessenger.sendAndWaitResponse(method, payload);

    return res;
  }
}

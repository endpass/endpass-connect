import { sendMessageToBridge, awaitBridgeMessage } from '@/util/message';
import { inlineStyles } from '@/util/dom';
import { METHODS } from '@/constants';

export const privateMethods = {
  mountDialog: Symbol('mountDialog'),
  createResizingSubscribtion: Symbol('createResizingSubscribtion'),
  handleDialogResize: Symbol('handleDialogResize'),
};

export default class Bridge {
  constructor({ url }) {
    this.url = url;
    this.frame = null;
    this.ready = false;
  }

  /**
   * Creates iframe element with styles, append it to the DOM of the current
   * application and save it to the class property for next actions with it
   */
  mount() {
    const iframeStyles = inlineStyles({
      position: 'absolute',
      top: '0',
      left: '0',
      width: '0',
      height: '0',
    });
    const iframeMarkup = `
      <iframe data-endpass="bridge" src="${this.url}" style="${iframeStyles}" />
    `;

    document.body.insertAdjacentHTML('afterBegin', iframeMarkup);

    this.frame = document.body.querySelector('[data-endpass="bridge"]');
  }

  /**
   * Checks bridge ready state
   * Ask iframe before til it give any anwser and resolve promise
   * Also, it is caches ready state and in the next time just resolve returned
   * promise
   * @returns {Promise<Boolean>}
   */
  checkReadyState() {
    return new Promise(resolve => {
      if (this.ready) {
        return resolve(true);
      }

      const interval = setInterval(() => {
        sendMessageToBridge(this.frame.contentWindow, {
          method: METHODS.READY_STATE_BRIDGE,
        });
      }, 250);

      this.awaitMessage(METHODS.READY_STATE_BRIDGE).then(() => {
        clearInterval(interval);

        this.ready = true;

        return resolve(true);
      });
    });
  }

  /**
   * Send message to the bridge
   * @param {Object} payload Message payload, must includes method for message
   *  identitification on connect application side
   * @returns {Promise}
   */
  async sendMessage(payload) {
    await this.checkReadyState();

    sendMessageToBridge(this.frame.contentWindow, payload);
  }

  /**
   * Awaits answer on message with given method from connect application
   * @param {String} method Expected message method
   * @returns {Object} Responded message payload
   */
  /* eslint-disable-next-line */
  async awaitMessage(method) {
    const res = await awaitBridgeMessage(method);

    return res;
  }

  /**
   * Wrapper on sendMessage and awaitMessage methods
   * Send message with given payload and awaits answer on it
   * @param {Object} payload Message payload. Must includes method property
   * @returns {Object} Responded message payload
   */
  async ask(payload) {
    if (!payload.method) {
      throw new Error('You sould provide method into you question to bridge!');
    }

    await this.sendMessage(payload);

    const res = await this.awaitMessage(payload.method);

    return res;
  }
}

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

  async sendMessage(payload) {
    await this.checkReadyState();

    sendMessageToBridge(this.frame.contentWindow, payload);
  }

  /* eslint-disable-next-line */
  async awaitMessage(method) {
    const res = await awaitBridgeMessage(method);

    return res;
  }

  async ask(payload) {
    if (!payload.method) {
      throw new Error('You sould provide method into you question to bridge!');
    }

    await this.sendMessage(payload);

    const res = await this.awaitMessage(payload.method);

    return res;
  }
}

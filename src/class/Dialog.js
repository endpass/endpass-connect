import {
  forceDialogMessage,
  sendMessageToDialog,
  awaitDialogMessage,
} from '@/util/message';
import { inlineStyles } from '@/util/dom';
import { METHODS } from '@/constants';

export const privateMethods = {
  mountDialog: Symbol('mountDialog'),
  createResizingSubscribtion: Symbol('createResizingSubscribtion'),
  handleDialogResize: Symbol('handleDialogResize'),
};

export default class Dialog {
  constructor({ url }) {
    this.url = url;
    this.resizeInterval = null;

    // Dialog elements nodes
    this.frame = null;
    this.overlay = null;
  }

  [privateMethods.mountDialog]() {
    const overlayStyles = inlineStyles({
      position: 'fixed',
      top: '0',
      left: '0',
      'z-index': '6000000',
      width: '100vw',
      height: '100vh',
      'overflow-y': 'auto',
      'background-color': 'rgba(0, 0, 0, 0.6)',
    });
    const wrapperStyles = inlineStyles({
      width: '360px',
      margin: '50px auto',
      transition: 'opacity 0.35s ease-in-out',
      opacity: '0',
    });
    const iframeStyles = inlineStyles({
      width: '100%',
      height: '100%',
      'box-shadow': '0 5px 10px 1px rgba(0, 0, 0, 0.15)',
      'border-radius': '4px',
    });
    const markup = `
      <div data-endpass="overlay" style="${overlayStyles}">
        <div data-endpass="wrapper" style="${wrapperStyles}">
          <iframe data-endpass="dialog" src="${
            this.url
          }" style="${iframeStyles}" />
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('afterBegin', markup);

    this.overlay = document.body.querySelector('[data-endpass="overlay"]');
    this.frame = document.body.querySelector('[data-endpass="dialog"]');

    this.frame.onload = () => {
      const wrapper = this.overlay.querySelector('[data-endpass="wrapper"]');

      // Dirty hack for make wrapper visible after correct resizing
      setTimeout(() => {
        wrapper.style.opacity = '1';
      }, 250);
    };
  }

  [privateMethods.createResizingSubscribtion]() {
    // TODO: may be better make interval more for prefomance reasons 🤔
    this.resizeInterval = setInterval(async () => {
      sendMessageToDialog(this.frame.contentWindow, {
        method: METHODS.RESIZE_DIALOG,
      });

      const res = await awaitDialogMessage(METHODS.RESIZE_DIALOG);

      this.frame.style.minHeight = `${res.result}px`;
    }, 100);
  }

  async open() {
    this[privateMethods.mountDialog]();
    this[privateMethods.createResizingSubscribtion]();

    const res = await forceDialogMessage(this.frame.contentWindow, {
      method: METHODS.READY_STATE_DIALOG,
    });

    if (!res.status) {
      throw new Error(
        res.message ||
          'Dialog was not opened due unexpected error! Please, try again',
      );
    }
  }

  close() {
    clearInterval(this.resizeInterval);
    this.resizeInterval = null;

    document.body.removeChild(this.overlay);
  }

  sendMessage(payload) {
    sendMessageToDialog(this.frame.contentWindow, payload);
  }

  /* eslint-disable-next-line */
  async awaitMessage(method) {
    const res = await awaitDialogMessage(method);

    return res;
  }

  async ask(payload) {
    if (!payload.method) {
      throw new Error('You sould provide method into you question to dialog!');
    }

    this.sendMessage(payload);

    const res = await this.awaitMessage(payload.method);

    return res;
  }
}

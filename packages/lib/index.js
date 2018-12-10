import Web3Dapp from 'web3-dapp';
import identityService from '@@/service/identity';
import { sendMessageToDialog } from '@@/util/message';
import { Emmiter, InpageProvider } from '@@/class';
import {
  INPAGE_EVENTS,
  HOST_WINDOW_NAME,
  DIALOG_WINDOW_NAME,
} from '@@/constants';

export default class Connect {
  constructor({ authUrl }) {
    this.authUrl = authUrl;
    this.emmiter = new Emmiter();
    this.provider = new InpageProvider(this.emmiter);

    // Net requests queue
    this.currentRequest = null;
    this.queueInterval = null;
    this.queue = [];

    this.setupEmmiterEvents();
    this.watchRequestsQueue();
  }

  watchRequestsQueue() {
    this.queueInterval = setInterval(() => {
      if (!this.currentRequest && this.queue.length > 0) {
        this.processCurrentRequest();
      }
    }, 2500);
  }

  async processCurrentRequest() {
    this.currentRequest = this.queue.pop();

    try {
      const res = await this.sign(this.currentRequest);

      console.log('sign success', res);
    } catch (err) {
      console.log('sign error', err);
    }
  }

  unwatchRequestsQueue() {
    clearInterval(this.queueInterval);
    this.queueInterval = null;
  }

  getAuthUrl(method) {
    return !method ? this.authUrl : `${this.authUrl}/#/${method}`;
  }

  setupEmmiterEvents() {
    this.emmiter.on(INPAGE_EVENTS.REQUEST, this.handleRequest.bind(this));
    this.emmiter.on(INPAGE_EVENTS.SETTINGS, this.handleRequest.bind(this));
  }

  /**
   * Check auth status on endpass identity service
   * @returns {Promise<Boolean>} Auth status
   */
  /* eslint-disable-next-line */
  async status() {
    try {
      const res = await identityService.getAccounts();

      return !!res;
    } catch (err) {
      return false;
    }
  }

  /* eslint-disable-next-line */
  async getAccountData() {
    try {
      const res = await identityService.getAccounts();

      return {
        activeAccount: res[0],
        activeNet: 1,
      };
    } catch (err) {
      return false;
    }
  }

  openApp(method) {
    const pos = {
      x: window.innerWidth / 2 - 200,
      y: 200,
    };
    const windowFeatures = [
      'chrome=yes',
      'centerscreen=yes',
      'resizable=no',
      'width=800',
      'height=800',
      `top=${pos.y}`,
      `left=${pos.x}`,
    ];

    window.name = HOST_WINDOW_NAME;

    return window.open(
      this.getAuthUrl(method),
      DIALOG_WINDOW_NAME,
      windowFeatures.join(','),
    );
  }

  /* eslint-disable-next-line */
  awaitDialogMessage() {
    return new Promise((resolve, reject) => {
      const handler = message => {
        if (!message.data) return;

        window.removeEventListener('message', handler);

        const { data } = message;
        const isMessageFromDialog = data.source === 'endpass-connect-dialog';

        if (isMessageFromDialog && data.status) {
          return resolve(data);
        }

        if (isMessageFromDialog && !data.status) {
          return reject(data.message);
        }
      };

      window.addEventListener('message', handler);
    });
  }

  auth() {
    // Auth popup closing must reject
    this.openApp('auth');

    return this.awaitDialogMessage();
  }

  async sign(request) {
    const dialog = this.openApp('sign');
    const isAuth = await this.awaitDialogMessage();

    if (isAuth) {
      sendMessageToDialog({
        target: dialog,
        data: {
          address: this.provider.settings.selectedAddress,
          net: this.provider.settings.networkVersion,
          request,
        },
      });
    }
  }

  /* eslint-disable-next-line */
  sendToNetwork(request) {
    console.log('send to network', request);
  }

  /* eslint-disable-next-line */
  handleRequest(request) {
    if (request.id) {
      this.queue.push(request);
    }
  }

  /* eslint-disable-next-line */
  sendSettings({ selectedAddress, networkVersion }) {
    this.emmiter.emit(INPAGE_EVENTS.SETTINGS, {
      selectedAddress,
      networkVersion,
    });
  }

  /* eslint-disable-next-line */
  sendResponse(data) {
    console.log('emit response', data);
    // this.emmiter.emit(INPAGE_EVENTS.RESPONSE, data);
  }

  /* eslint-disable-next-line */
  provideWeb3() {}

  /* eslint-disable-next-line */
  async injectWeb3(target = window) {
    if (!target.web3) {
      Object.assign(target, {
        web3: new Web3Dapp(),
      });
      target.web3.setProvider(this.provider);
    } else {
      console.log('web3 new');
    }
  }
}

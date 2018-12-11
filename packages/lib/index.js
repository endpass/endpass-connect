import { omit } from 'lodash';
import Web3Dapp from 'web3-dapp';
import identityService from '@@/service/identity';
import { sendMessageToDialog, awaitDialogMessage } from '@@/util/message';
import web3 from '@@/class/singleton/web3';
import { Emmiter, InpageProvider } from '@@/class';
import {
  INPAGE_EVENTS,
  HOST_WINDOW_NAME,
  DIALOG_WINDOW_NAME,
  DAPP_WHITELISTED_METHODS,
} from '@@/constants';

export default class Connect {
  constructor({ authUrl, subscribe }) {
    this.authUrl = authUrl;
    this.emmiter = new Emmiter();
    this.provider = new InpageProvider(this.emmiter);

    // Net requests queue
    this.currentRequest = null;
    this.queueInterval = null;
    this.queue = [];

    if (subscribe) {
      this.setupEmmiterEvents();
      this.watchRequestsQueue();
    }
  }

  watchRequestsQueue() {
    this.queueInterval = setInterval(() => {
      if (!this.currentRequest && this.queue.length > 0) {
        this.currentRequest = this.queue.pop();
        this.processCurrentRequest();
      }
    }, 2500);
  }

  unwatchRequestsQueue() {
    clearInterval(this.queueInterval);
    this.queueInterval = null;
  }

  async processCurrentRequest() {
    const { currentRequest } = this;

    try {
      const res = DAPP_WHITELISTED_METHODS.includes(currentRequest.method)
        ? await this.sign()
        : await this.sendToNetwork();

      this.sendResponse(res);
    } catch (err) {
      console.error('sign error', err);

      this.sendResponse({
        ...currentRequest,
        result: null,
        error: err,
      });
    } finally {
      this.currentRequest = null;
    }
  }

  getAuthUrl(method) {
    return !method ? this.authUrl : `${this.authUrl}/#/${method}`;
  }

  setupEmmiterEvents() {
    this.emmiter.on(INPAGE_EVENTS.REQUEST, this.handleRequest.bind(this));
    this.emmiter.on(INPAGE_EVENTS.SETTINGS, this.handleRequest.bind(this));
  }

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
      'width=480',
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

  auth() {
    // Auth popup closing must reject
    this.openApp('auth');

    return awaitDialogMessage();
  }

  async sign() {
    const isAuthorized = await this.status();

    if (!isAuthorized) throw new Error('User not autorized');

    const dialog = this.openApp('sign');

    await awaitDialogMessage();

    sendMessageToDialog({
      target: dialog,
      data: {
        url: window.location.origin,
        address: this.provider.settings.selectedAddress,
        net: this.provider.settings.networkVersion,
        request: this.currentRequest,
      },
    });

    const signMessage = await awaitDialogMessage();

    // TODO: handle cases if status === false and throw error
    return omit(signMessage.data, ['source']);
  }

  async sendToNetwork() {
    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync(this.currentRequest, (err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve(res);
      });
    });
  }

  handleRequest(request) {
    if (request.id) {
      this.queue.push(request);
    }
  }

  sendSettings({ selectedAddress, networkVersion }) {
    this.emmiter.emit(INPAGE_EVENTS.SETTINGS, {
      selectedAddress,
      networkVersion,
    });
  }

  sendResponse(payload) {
    this.emmiter.emit(INPAGE_EVENTS.RESPONSE, payload);
  }

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

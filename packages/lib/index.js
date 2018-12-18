import omit from 'lodash/omit';
import Web3Dapp from 'web3-dapp';
import { sendMessageToDialog, awaitDialogMessage } from '@@/util/message';
import identityService from '@@/service/identity';
import Emmiter from '@@/class/Emmiter';
import InpageProvider from '@@/class/InpageProvider';
import {
  INPAGE_EVENTS,
  HOST_WINDOW_NAME,
  DIALOG_WINDOW_NAME,
  DAPP_WHITELISTED_METHODS,
} from '@@/constants';

export default class Connect {
  constructor({ appUrl, subscribe }) {
    if (!appUrl) {
      throw new Error(
        'Pass url to connect application instance in appUrl proprerty!',
      );
    }

    this.appUrl = appUrl;
    this.emmiter = new Emmiter();
    this.provider = new InpageProvider(this.emmiter);
    this.requestProvider = null;

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

  getConnectUrl(method) {
    return !method ? this.appUrl : `${this.appUrl}/#/${method}`;
  }

  setupEmmiterEvents() {
    this.emmiter.on(INPAGE_EVENTS.REQUEST, this.handleRequest.bind(this));
    this.emmiter.on(INPAGE_EVENTS.SETTINGS, this.handleRequest.bind(this));
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
      throw new Error('User not autorized!');
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
      this.getConnectUrl(method),
      DIALOG_WINDOW_NAME,
      windowFeatures.join(','),
    );
  }

  /**
   * Open application on auth screen and waits result (success of failure)
   * @returns {Promise<Object>} Auth result, check `status` property to
   *  know about result
   */
  auth() {
    this.openApp('auth');

    // TODO format returning value here for more transparency
    return awaitDialogMessage();
  }

  async sign() {
    await this.getAccountData();

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

    // TODO handle cases if status === false and throw error
    return omit(signMessage.data, ['source']);
  }

  async sendToNetwork() {
    return new Promise((resolve, reject) => {
      this.requestProvider.sendAsync(this.currentRequest, (err, res) => {
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

  /**
   * Sets settings to current `web3` provider injected to page with `injectWeb3`
   * method
   * @param {String} options.selectedAddress Currenct account checksummed address
   * @param {String} options.networkVersion Active network ID
   */
  sendSettings({ selectedAddress, networkVersion }) {
    this.emmiter.emit(INPAGE_EVENTS.SETTINGS, {
      selectedAddress,
      networkVersion,
    });
  }

  sendResponse(payload) {
    this.emmiter.emit(INPAGE_EVENTS.RESPONSE, payload);
  }

  /**
   * Injects `web3` with "monkey patching" to given target
   * By default injects `web3` to window in the current context
   * @param  {Window} target Target window object
   */
  async injectWeb3(target = window) {
    if (!target.web3) {
      const web3 = new Web3Dapp(this.provider);

      Object.assign(target, {
        web3,
      });
    }

    Object.assign(target, {
      ethereum: this.provider,
    });

    this.createRequestProvider(target.web3);
  }

  createRequestProvider(web3) {
    this.requestProvider = new web3.providers.HttpProvider(
      'https://eth-mainnet.endpass.com:2083',
    );
  }
}

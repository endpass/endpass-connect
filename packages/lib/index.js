import omit from 'lodash/omit';
import get from 'lodash/get';
import Web3Dapp from 'web3-dapp';
import {
  sendMessageToDialog,
  sendMessageToBridge,
  awaitDialogMessage,
  awaitBridgeMessage,
} from '@@/util/message';
import Emmiter from '@@/class/Emmiter';
import InpageProvider from '@@/class/InpageProvider';
import {
  INPAGE_EVENTS,
  HOST_WINDOW_NAME,
  DIALOG_WINDOW_NAME,
  DAPP_WHITELISTED_METHODS,
  DEFAULT_NETWORKS,
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

    // Bridge
    this.bridge = this.injectBridge();

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

  injectBridge() {
    const iframeElement = document.createElement('iframe');

    iframeElement.src = this.getConnectUrl('bridge');
    iframeElement.width = 0;
    iframeElement.height = 0;

    Object.assign(iframeElement.style, {
      position: 'absolute',
      top: 0,
      left: 0,
    });

    document.body.appendChild(iframeElement);

    return iframeElement;
  }

  async checkBridgeReady() {
    return new Promise(resolve => {
      let interval;

      awaitBridgeMessage().then(res => {
        clearInterval(interval);
        return resolve(res);
      });

      interval = setInterval(() => {
        sendMessageToBridge({
          target: this.bridge.contentWindow,
          data: {
            method: 'check_ready',
          },
        });
      }, 250);
    });
  }

  /* eslint-disable-next-line */
  async getUserSettings() {
    await this.checkBridgeReady();

    sendMessageToBridge({
      target: this.bridge.contentWindow,
      data: {
        method: 'get_accounts',
      },
    });

    const res = await awaitBridgeMessage();

    return res;
  }

  /* eslint-disable-next-line */
  async getAccountData() {
    try {
      const settings = await this.getUserSettings();

      return {
        activeAccount: settings.lastActiveAccount,
        activeNet: settings.net || 1,
      };
    } catch (err) {
      throw new Error('User not autorized!');
    }
  }

  /**
   * Open application on auth screen and waits result (success of failure)
   * @returns {Promise<Object>} Auth result, check `status` property to
   *  know about result
   */
  async auth(redirectUrl) {
    const dialog = await this.openApp('auth');

    sendMessageToDialog({
      target: dialog,
      data: {
        url: redirectUrl || null,
      },
    });

    // TODO format returning value here for more transparency
    const res = awaitDialogMessage();

    return res;
  }

  async logout() {
    this.openApp();

    await awaitDialogMessage();

    return awaitDialogMessage();
  }

  async sign() {
    // TODO ???
    await this.getAccountData();

    const dialog = await this.openApp('sign');
    const { selectedAddress, networkVersion } = this.getSettings();

    sendMessageToDialog({
      target: dialog,
      data: {
        url: window.location.origin,
        address: selectedAddress,
        net: networkVersion,
        request: this.currentRequest,
      },
    });

    const signResultMessage = await awaitDialogMessage();

    // TODO handle cases if status === false and throw error
    return omit(signResultMessage.data, ['source']);
  }

  // "Normal methods" which dont need refactoring

  async openApp(method) {
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

    const dialog = window.open(
      this.getConnectUrl(method),
      DIALOG_WINDOW_NAME,
      windowFeatures.join(','),
    );

    await awaitDialogMessage();

    return dialog;
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

  getSettings() {
    return this.provider.settings;
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
    const injection = {
      ethereum: this.provider,
    };

    if (!target.web3) {
      Object.assign(injection, {
        web3: new Web3Dapp(this.provider),
      });
    }

    Object.assign(target, injection);

    this.createRequestProvider(target.web3);
  }

  createRequestProvider(web3) {
    const { networkVersion } = this.getSettings();

    this.requestProvider = new web3.providers.HttpProvider(
      get(DEFAULT_NETWORKS, `${networkVersion}.url[0]`),
    );
  }
}

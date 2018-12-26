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
  METHODS,
  INPAGE_EVENTS,
  DAPP_WHITELISTED_METHODS,
  DEFAULT_NETWORKS,
} from '@@/constants';

// TODO divide private and public methods
// TODO add methods to auth, sign and login

export default class Connect {
  /**
   * @param {String} options.appUrl
   * @param {Boolean} options.subscribe
   */
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

  /**
   *
   */
  watchRequestsQueue() {
    this.queueInterval = setInterval(() => {
      if (!this.currentRequest && this.queue.length > 0) {
        this.currentRequest = this.queue.pop();
        this.processCurrentRequest();
      }
    }, 2500);
  }

  /**
   *
   */
  unwatchRequestsQueue() {
    clearInterval(this.queueInterval);
    this.queueInterval = null;
  }

  /**
   * Requests processing
   */

  /**
   * @returns {Promise}
   */
  async processCurrentRequest() {
    const { currentRequest } = this;

    try {
      const res = DAPP_WHITELISTED_METHODS.includes(currentRequest.method)
        ? await this.sign()
        : await this.sendToNetwork();

      this.sendResponse(res);
    } catch (err) {
      this.sendResponse({
        ...currentRequest,
        result: null,
        error: err,
      });
    } finally {
      this.currentRequest = null;
    }
  }

  /**
   * @param {String} method
   * @returns {String}
   */
  getConnectUrl(method) {
    return !method ? this.appUrl : `${this.appUrl}/#/${method}`;
  }

  /**
   *
   */
  setupEmmiterEvents() {
    this.emmiter.on(INPAGE_EVENTS.REQUEST, this.handleRequest.bind(this));
    this.emmiter.on(INPAGE_EVENTS.SETTINGS, this.handleRequest.bind(this));
  }

  /**
   * @returns {HTMLElement}
   */
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

  /**
   * @returns {Promise<Object>}
   */
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
   * Direct messaging methods
   */

  /**
   * Open application on auth screen and waits result (success of failure)
   * @returns {Promise<boolean>} Auth result, check `status` property to
   *  know about result
   */
  auth(redirectUrl) {
    return this.openApp('auth')
      .then(dialog => {
        sendMessageToDialog(dialog, {
          method: METHODS.AUTH,
          url: redirectUrl || null,
        });

        return awaitDialogMessage();
      })
      .then(res => {
        if (!res.status)
          throw new Error(res.message || 'Authentificaton error!');

        return res.status;
      });
  }

  /**
   * @returns {Promise<boolean>}
   */
  logout() {
    return this.openApp()
      .then(() => awaitDialogMessage())
      .then(res => {
        if (!res.status) throw new Error(res.message || 'Logout error!');

        return res.status;
      });
  }

  /**
   * @returns {Promise<Object>}
   */
  sign() {
    return this.openApp('sign')
      .then(dialog => {
        const { selectedAddress, networkVersion } = this.getSettings();

        sendMessageToDialog(dialog, {
          method: METHODS.SIGN,
          url: window.location.origin,
          address: selectedAddress,
          net: networkVersion,
          request: this.currentRequest,
        });

        return awaitDialogMessage();
      })
      .then(res => {
        if (!res.status) throw new Error(res.message || 'Sign error!');

        return omit(res, ['status']);
      });
  }

  /**
   * @returns {Promise<Object>}
   */
  getUserSettings() {
    return this.checkBridgeReady().then(() => {
      sendMessageToBridge(this.bridge.contentWindow, {
        method: METHODS.GET_SETTINGS,
      });

      return awaitBridgeMessage();
    });
  }

  /**
   * @returns {Promise<Boolean>}
   */
  async checkBridgeReady() {
    return new Promise(resolve => {
      let interval;

      awaitBridgeMessage().then(res => {
        clearInterval(interval);
        return resolve(res.status);
      });

      interval = setInterval(() => {
        sendMessageToBridge(this.bridge.contentWindow, {
          method: METHODS.READY_STATE_BRIDGE,
        });
      }, 250);
    });
  }

  // "Normal methods" which dont need refactoring

  /**
   * @param {String} route
   * @returns {Promise<Window>}
   */
  async openApp(route) {
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

    const dialog = window.open(
      this.getConnectUrl(route),
      null,
      windowFeatures.join(','),
    );

    await awaitDialogMessage();

    return dialog;
  }

  /**
   * @returns {Promise<Object>}
   */
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

  /**
   * @param {Object} request
   */
  handleRequest(request) {
    if (request.id) this.queue.push(request);
  }

  /**
   * @returns {Object}
   */
  getSettings() {
    return this.provider.settings;
  }

  /**
   * Sets settings to current `web3` provider injected to page with `injectWeb3`
   *  method
   * @param {String} options.selectedAddress Currenct account checksummed address
   * @param {String} options.networkVersion Active network ID
   */
  sendSettings({ selectedAddress, networkVersion }) {
    this.emmiter.emit(INPAGE_EVENTS.SETTINGS, {
      selectedAddress,
      networkVersion,
    });
  }

  /**
   * @param {Object} payload
   */
  sendResponse(payload) {
    this.emmiter.emit(INPAGE_EVENTS.RESPONSE, payload);
  }

  /**
   * Injects `web3` with "monkey patching" to given target
   * By default injects `web3` to window in the current context
   * @param  {Window} target Target window object
   */
  injectWeb3(target = window) {
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

  /**
   * @param   {[type]} web3
   * @returns {[type]}
   */
  createRequestProvider(web3) {
    const { networkVersion } = this.getSettings();

    this.requestProvider = new web3.providers.HttpProvider(
      get(DEFAULT_NETWORKS, `${networkVersion}.url[0]`),
    );
  }
}

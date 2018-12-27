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

export const privateMethods = {
  checkBridgeReady: Symbol('checkBridgeReady'),
  watchRequestsQueue: Symbol('watchRequestsQueue'),
  unwatchRequestsQueue: Symbol('unwatchRequestsQueue'),
  processCurrentRequest: Symbol('processCurrentRequest'),
  getConnectUrl: Symbol('getConnectUrl'),
  setupEmmiterEvents: Symbol('setupEmmiterEvents'),
  injectBridge: Symbol('injectBridge'),
  createRequestProvider: Symbol('createRequestProvider'),
  getUserSettings: Symbol('getUserSettings'),
  sendResponse: Symbol('sendResponse'),
  handleRequest: Symbol('handleRequest'),
  sendToNetwork: Symbol('sendToNetwork'),
  openApp: Symbol('openApp'),
  sign: Symbol('sign'),
};

export default class Connect {
  /**
   * @param {String} options.appUrl
   * @param {Boolean} options.subscribe
   */
  constructor({ appUrl }) {
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
    this.bridge = this[privateMethods.injectBridge]();
    this[privateMethods.setupEmmiterEvents]();
    this[privateMethods.watchRequestsQueue]();
  }

  /**
   *
   */
  [privateMethods.watchRequestsQueue]() {
    this.queueInterval = setInterval(() => {
      if (!this.currentRequest && this.queue.length > 0) {
        this.currentRequest = this.queue.pop();
        this[privateMethods.processCurrentRequest]();
      }
    }, 2500);
  }

  /**
   * Requests processing
   */

  /**
   * @returns {Promise}
   */
  async [privateMethods.processCurrentRequest]() {
    const { currentRequest } = this;

    try {
      const res = DAPP_WHITELISTED_METHODS.includes(currentRequest.method)
        ? await this[privateMethods.sign]()
        : await this[privateMethods.sendToNetwork]();

      this[privateMethods.sendResponse](res);
    } catch (err) {
      this[privateMethods.sendResponse]({
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
  [privateMethods.getConnectUrl](method) {
    return !method ? this.appUrl : `${this.appUrl}/#/${method}`;
  }

  /**
   *
   */
  [privateMethods.setupEmmiterEvents]() {
    this.emmiter.on(
      INPAGE_EVENTS.REQUEST,
      this[privateMethods.handleRequest].bind(this),
    );
    this.emmiter.on(
      INPAGE_EVENTS.SETTINGS,
      this[privateMethods.handleRequest].bind(this),
    );
  }

  /**
   * @returns {HTMLElement}
   */
  [privateMethods.injectBridge]() {
    const iframeElement = document.createElement('iframe');

    iframeElement.src = this[privateMethods.getConnectUrl]('bridge');
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
   * Direct messaging methods
   */

  /**
   * @returns {Promise<Object>}
   */
  [privateMethods.getUserSettings]() {
    return this[privateMethods.checkBridgeReady]().then(() => {
      sendMessageToBridge(this.bridge.contentWindow, {
        method: METHODS.GET_SETTINGS,
      });

      return awaitBridgeMessage(METHODS.GET_SETTINGS);
    });
  }

  /**
   * @returns {Promise<Boolean>}
   */
  [privateMethods.checkBridgeReady]() {
    return new Promise(resolve => {
      let interval;

      awaitBridgeMessage(METHODS.READY_STATE_BRIDGE).then(res => {
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
  async [privateMethods.openApp](route) {
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
      this[privateMethods.getConnectUrl](route),
      null,
      windowFeatures.join(','),
    );

    const res = await awaitDialogMessage(METHODS.READY_STATE_DIALOG);

    return dialog;
  }

  /**
   * @returns {Promise<Object>}
   */
  async [privateMethods.sendToNetwork]() {
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
  [privateMethods.handleRequest](request) {
    if (request.id) this.queue.push(request);
  }

  /**
   * @returns {Object}
   */
  [privateMethods.getSettings]() {
    return this.provider.settings;
  }

  /**
   * @param {Object} payload
   */
  [privateMethods.sendResponse](payload) {
    this.emmiter.emit(INPAGE_EVENTS.RESPONSE, payload);
  }

  /**
   * @param   {[type]} web3
   * @returns {[type]}
   */
  [privateMethods.createRequestProvider](web3) {
    const { networkVersion } = this[privateMethods.getSettings]();

    this.requestProvider = new web3.providers.HttpProvider(
      get(DEFAULT_NETWORKS, `${networkVersion}.url[0]`),
    );
  }

  /**
   * @returns {Promise<Object>}
   */
  async [privateMethods.sign]() {
    const dialog = await this[privateMethods.openApp]('sign');
    const { selectedAddress, networkVersion } = this[
      privateMethods.getSettings
    ]();

    sendMessageToDialog(dialog, {
      method: METHODS.SIGN,
      url: window.location.origin,
      address: selectedAddress,
      net: networkVersion,
      request: this.currentRequest,
    });

    const res = await awaitDialogMessage(METHODS.SIGN);

    if (!res.status) throw new Error(res.message || 'Sign error!');

    return omit(res, ['status']);
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

    this[privateMethods.createRequestProvider](target.web3);
  }

  /**
   * @returns {Promise<Object>}
   */
  async getAccountData() {
    try {
      const settings = await this[privateMethods.getUserSettings]();

      return {
        activeAccount: settings.lastActiveAccount,
        activeNet: settings.net || 1,
      };
    } catch (err) {
      throw new Error('User not autorized!');
    }
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
   * Open application on auth screen and waits result (success of failure)
   * @returns {Promise<boolean>} Auth result, check `status` property to
   *  know about result
   */
  async auth(redirectUrl) {
    const dialog = await this[privateMethods.openApp]('auth');

    sendMessageToDialog(dialog, {
      method: METHODS.AUTH,
      redirectUrl: redirectUrl || null,
    });

    const res = await awaitDialogMessage(METHODS.AUTH);

    if (!res.status) throw new Error(res.message || 'Authentificaton error!');

    return res.status;
  }

  /**
   * @returns {Promise<boolean>}
   */
  async logout() {
    await this[privateMethods.openApp]();
    const res = await awaitDialogMessage(METHODS.LOGOUT);

    if (!res.status) throw new Error(res.message || 'Logout error!');

    return res.status;
  }
}

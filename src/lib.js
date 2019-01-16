import omit from 'lodash/omit';
import get from 'lodash/get';
import Web3Dapp from 'web3-dapp';
import {
  sendMessageToDialog,
  sendMessageToBridge,
  awaitDialogMessage,
  awaitBridgeMessage,
} from '@/util/message';
import Emmiter from '@/class/Emmiter';
import InpageProvider from '@/class/InpageProvider';
import {
  METHODS,
  INPAGE_EVENTS,
  DAPP_WHITELISTED_METHODS,
  DEFAULT_NETWORKS,
} from '@/constants';

/**
 * Private methods which can not be called by user from connect instance
 * Commonly using the "inner" logic of connect
 */
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

    this.bridge = this[privateMethods.injectBridge]();
    this[privateMethods.setupEmmiterEvents]();
    this[privateMethods.watchRequestsQueue]();
  }

  /**
   * Sets interval and checks queue for new requests. If current request is not
   * present – sets it and then process
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
   * Process current request
   * If request method present in whitelist – it should be signed by user
   * In other cases request will be send to network with web3
   * In the both cases – result will be passed back to injected provider
   * @returns {Promise<Object>} Request processing result
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
   * Returns connect application url with passed method
   * @param {String} method Expected method (route)
   * @returns {String} Completed url to open
   */
  [privateMethods.getConnectUrl](method) {
    return !method ? this.appUrl : `${this.appUrl}/#/${method}`;
  }

  /**
   * Sets event listeners to inner emmiter with handlers
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
   * Injects iframe-bridge to opened page and returns link to injected element
   * @returns {HTMLElement} Injected iframe element
   */
  [privateMethods.injectBridge]() {
    const iframeElement = document.createElement('iframe');

    iframeElement.src = this[privateMethods.getConnectUrl]('bridge');

    Object.assign(iframeElement.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    });

    document.body.appendChild(iframeElement);

    return iframeElement;
  }

  /**
   * Requests user settings from connect application
   * @returns {Promise<Object>} User settings
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
   * Checks connect bridge ready state
   * Resolves only if bridge is available and can send ready state message
   * @returns {Promise<Boolean>}
   */
  [privateMethods.checkBridgeReady]() {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        sendMessageToBridge(this.bridge.contentWindow, {
          method: METHODS.READY_STATE_BRIDGE,
        });
      }, 250);

      awaitBridgeMessage(METHODS.READY_STATE_BRIDGE).then(res => {
        clearInterval(interval);
        return resolve(res.status);
      });
    });
  }

  /**
   * Opens application with given route in child window
   * Also awaits ready state message from dialog
   * After receiving message – returns link to opened window
   * @param {String} route Target connect application route
   * @returns {Promise<Window>} Opened child window
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

    await awaitDialogMessage(METHODS.READY_STATE_DIALOG);

    return dialog;
  }

  /**
   * Sends current request to network with request provider and returns result
   * @returns {Promise<Object>} Result from network
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
   * Handle requests and push them to the requests queue
   * @param {Object} request Incoming request
   */
  [privateMethods.handleRequest](request) {
    if (request.id) this.queue.push(request);
  }

  /**
   * Returns injeted provider settings
   * @returns {Object} Current provider settings
   */
  [privateMethods.getSettings]() {
    return this.provider.settings;
  }

  /**
   * Sends response to injected provider
   * @param {Object} payload Response payload object
   */
  [privateMethods.sendResponse](payload) {
    if (payload.error) {
      console.error(`Request have return error: ${payload.error}`);
    }

    this.emmiter.emit(INPAGE_EVENTS.RESPONSE, payload);
  }

  /**
   * Creates requsts provider and save it to the instance property
   * @param {Web3} web3 Web3 instance which will provide providers
   */
  [privateMethods.createRequestProvider](web3) {
    const { networkVersion } = this[privateMethods.getSettings]();

    this.requestProvider = new web3.providers.HttpProvider(
      get(DEFAULT_NETWORKS, `${networkVersion}.url[0]`),
    );
  }

  /**
   * Sends current request to connect application dialog, opens it and
   * awaits sign result
   * @returns {Promise<Object>} Sign result
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

  // Public methods

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
   * Requests user settings from injected bridge and returns formatted data
   * Settings includes last active account and network id
   * Throws error if settings can not be resolved
   * @returns {Promise<Object>} Account data
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
   * Opens connect application on logout screen (now on the root screen) and
   * awaits logout message
   * @returns {Promise<boolean>}
   */
  async logout() {
    await this[privateMethods.openApp]();

    const res = await awaitDialogMessage(METHODS.LOGOUT);

    if (!res.status) throw new Error(res.message || 'Logout error!');

    return res.status;
  }
}

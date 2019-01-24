import omit from 'lodash/omit';
import get from 'lodash/get';
// TODO: move all bridge things to abstraction, like dialog🤔
import { sendMessageToBridge, awaitBridgeMessage } from '@/util/message';
import { inlineStyles } from '@/util/dom';
import Emmiter from '@/class/Emmiter';
import InpageProvider from '@/class/InpageProvider';
import Dialog from '@/class/Dialog';
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
  processCurrentRequest: Symbol('processCurrentRequest'),
  processWhitelistedRequest: Symbol('processWhitelistedRequest'),
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
  recover: Symbol('recover'),
};

export default class Connect {
  /**
   * @param {String} options.authUrl Url of hosted Endpass Connect Application
   */
  constructor({ authUrl }) {
    this.authUrl = authUrl || 'https://auth.endpass.com';
    this.emmiter = new Emmiter();
    this.provider = new InpageProvider(this.emmiter);
    this.requestProvider = null;

    // Net requests queue
    this.currentRequest = null;
    this.queueInterval = null;
    this.queue = [];

    this.dialog = null;
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
        ? await this[privateMethods.processWhitelistedRequest]()
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
   * Process request which contains method from whitelist
   * If request means recovery – recover address and returns address
   * In other cases – sign and returns signature
   * @returns {Promise<String>} Recovered address or signature
   */
  [privateMethods.processWhitelistedRequest]() {
    if (this.currentRequest.method === 'personal_ecRecover') {
      return this[privateMethods.recover]();
    }

    return this[privateMethods.sign]();
  }

  /**
   * Returns connect application url with passed method
   * @param {String} method Expected method (route)
   * @returns {String} Completed url to open
   */
  [privateMethods.getConnectUrl](method) {
    return !method ? this.authUrl : `${this.authUrl}/#/${method}`;
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
    const iframeStyles = inlineStyles({
      position: 'absolute',
      top: '0',
      left: '0',
      width: '0',
      height: '0',
    });
    const iframeMarkup = `
      <iframe data-endpass="bridge" src="${this[privateMethods.getConnectUrl](
        'bridge',
      )}" style="${iframeStyles}" />
    `;

    document.body.insertAdjacentHTML('afterBegin', iframeMarkup);

    return document.body.querySelector('[data-endpass="bridge"]');
  }

  /**
   * Requests user settings from connect application
   * @returns {Promise<Object>} User settings
   */
  async [privateMethods.getUserSettings]() {
    await this[privateMethods.checkBridgeReady]();
    sendMessageToBridge(this.bridge.contentWindow, {
      method: METHODS.GET_SETTINGS,
    });

    const res = await awaitBridgeMessage(METHODS.GET_SETTINGS);

    if (!res.status) {
      throw new Error(res.message || 'User settings are not received!');
    }

    return res;
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
  async [privateMethods.openApp](route = '') {
    const url = this[privateMethods.getConnectUrl](route);

    this.dialog = new Dialog({ url });

    await this.dialog.open();
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
    await this[privateMethods.openApp]('sign');

    const { selectedAddress, networkVersion } = this[
      privateMethods.getSettings
    ]();

    const res = await this.dialog.ask({
      method: METHODS.SIGN,
      url: window.location.origin,
      address: selectedAddress,
      net: networkVersion,
      request: this.currentRequest,
    });

    this.dialog.close();

    if (!res.status) throw new Error(res.message || 'Sign error!');

    return omit(res, ['status']);
  }

  /**
   * Recovers current request and returns recovered address
   * @returns {Promise<String>} Recovered address
   */
  async [privateMethods.recover]() {
    const { selectedAddress, networkVersion } = this[
      privateMethods.getSettings
    ]();

    sendMessageToBridge(this.bridge.contentWindow, {
      method: METHODS.RECOVER,
      address: selectedAddress,
      net: networkVersion,
      request: this.currentRequest,
    });

    const res = await awaitBridgeMessage(METHODS.RECOVER);

    if (!res.status) throw new Error(res.message || 'Recovery error!');

    return omit(res, ['status']);
  }

  // Public methods

  /**
   * Creates provider for inner requests and returns inpage provider for
   * injection in client's web3 instance
   * @param {Web3} web3 Web3 instance
   *  If it is not passed web3 will be looked in application window object
   *  If application window not contains web3 – throws an error
   * @returns {Web3.Provider} Inpage provider for injections into application
   *  Web3 instance
   */
  createProvider(web3) {
    if (!web3 && !window.web3) {
      throw new Error(
        'Pass web3 instance as argument or provide it globally in window object!',
      );
    }

    this[privateMethods.createRequestProvider](web3 || window.web3);

    return this.provider;
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
    await this[privateMethods.openApp]('auth');

    const res = await this.dialog.ask({
      method: METHODS.AUTH,
      redirectUrl: redirectUrl || null,
    });

    this.dialog.close();

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

    const res = await this.dialog.ask({
      method: METHODS.LOGOUT,
    });

    this.dialog.close();

    if (!res.status) throw new Error(res.message || 'Logout error!');

    return res.status;
  }
}

import omit from 'lodash/omit';
import get from 'lodash/get';
import { Emmiter, InpageProvider, Dialog, Bridge } from '@/class';
import {
  METHODS,
  INPAGE_EVENTS,
  DAPP_WHITELISTED_METHODS,
  DEFAULT_NETWORKS,
} from '@/constants';
import createInpageProvider from '@/util/createInpageProvider';
import pkg from '../package.json';

console.info(
  `%cEndpass connect version ${pkg.version} loaded 🔌`,
  'color: #fff; background: #4B0873',
);

/**
 * Private methods which can not be called by user from connect instance
 * Commonly using the "inner" logic of connect
 */
export const privateMethods = {
  subscribeOnRequestsQueueChanges: Symbol('subscribeOnRequestsQueueChanges'),
  processCurrentRequest: Symbol('processCurrentRequest'),
  processWhitelistedRequest: Symbol('processWhitelistedRequest'),
  getConnectUrl: Symbol('getConnectUrl'),
  setupEmmiterEvents: Symbol('setupEmmiterEvents'),
  initBridge: Symbol('initBridge'),
  createRequestProvider: Symbol('createRequestProvider'),
  createInpageProvider: Symbol('createInpageProvider'),
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
  constructor(options = {}) {
    /* eslint-disable-next-line */
    this.authUrl = options.authUrl || 'https://auth.endpass.com';
    this.emitter = new Emmiter();
    this.provider = new InpageProvider(this.emitter);
    this.requestProvider = null;

    // Net requests queue
    this.currentRequest = null;
    this.queueInterval = null;
    this.queue = [];

    // Abstractions instances
    this.dialog = null;
    this.bridge = null;

    this[privateMethods.initBridge]();
    this[privateMethods.setupEmmiterEvents]();
    this[privateMethods.subscribeOnRequestsQueueChanges]();
  }

  /**
   * Sets interval and checks queue for new requests. If current request is not
   * present – sets it and then process
   * @private
   */
  [privateMethods.subscribeOnRequestsQueueChanges]() {
    this.queueInterval = setInterval(() => {
      if (!this.currentRequest && this.queue.length > 0) {
        this.currentRequest = this.queue.pop();
        this[privateMethods.processCurrentRequest]();
      }
    }, 2000);
  }

  /**
   * Process current request
   * If request method present in whitelist – it should be signed by user
   * In other cases request will be send to network with web3
   * In the both cases – result will be passed back to injected provider
   * @private
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
   * @private
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
   * @private
   * @param {String} method Expected method (route)
   * @returns {String} Completed url to open
   */
  [privateMethods.getConnectUrl](method) {
    return !method ? this.authUrl : `${this.authUrl}/${method}`;
  }

  /**
   * Sets event listeners to inner emitter with handlers
   * @private
   */
  [privateMethods.setupEmmiterEvents]() {
    this.emitter.on(
      INPAGE_EVENTS.REQUEST,
      this[privateMethods.handleRequest].bind(this),
    );
    this.emitter.on(
      INPAGE_EVENTS.SETTINGS,
      this[privateMethods.handleRequest].bind(this),
    );
  }

  /**
   * Injects iframe-bridge to opened page and returns link to injected element
   * @private
   * @returns {HTMLElement} Injected iframe element
   */
  [privateMethods.initBridge]() {
    this.bridge = new Bridge({
      url: this[privateMethods.getConnectUrl]('bridge'),
    });
    this.bridge.mount();
  }

  /**
   * Requests user settings from connect application
   * @private
   * @throws {Error} If settings request failed
   * @returns {Promise<Object>} User settings
   */
  async [privateMethods.getUserSettings]() {
    const res = await this.bridge.ask({
      method: METHODS.GET_SETTINGS,
    });

    if (!res.status) {
      throw new Error(res.message || 'User settings are not received!');
    }

    return res;
  }

  /**
   * Opens application with given route in child window
   * Also awaits ready state message from dialog
   * After receiving message – returns link to opened window
   * @private
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
   * @private
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
   * @private
   * @param {Object} request Incoming request
   */
  [privateMethods.handleRequest](request) {
    if (request.id) this.queue.push(request);
  }

  /**
   * Returns injeted provider settings
   * @private
   * @returns {Object} Current provider settings
   */
  [privateMethods.getSettings]() {
    return this.provider.settings;
  }

  /**
   * Sends response to injected provider
   * @private
   * @param {Object} payload Response payload object
   */
  [privateMethods.sendResponse](payload) {
    if (payload.error) {
      console.error(`Request have return error: ${payload.error}`);
    }

    this.emitter.emit(INPAGE_EVENTS.RESPONSE, payload);
  }

  /**
   * Creates requsts provider and save it to the instance property
   * @private
   * @param {Web3.Provider} provider Web3 provider class
   */
  [privateMethods.createRequestProvider](provider) {
    const { activeNet } = this[privateMethods.getSettings]();

    /* eslint-disable-next-line */
    this.requestProvider = new provider(
      get(DEFAULT_NETWORKS, `${activeNet}.url[0]`),
    );
  }

  // TODO: Not ready yet (>= web3 1.0.0-beta.40 support)
  [privateMethods.createInpageProvider](provider) {
    const { activeNet } = this[privateMethods.getSettings]();

    this.provider = createInpageProvider({
      emitter: this.emitter,
      url: get(DEFAULT_NETWORKS, `${activeNet}.url[0]`),
      provider,
    });
  }

  /**
   * Sends current request to connect application dialog, opens it and
   * awaits sign result
   * @private
   * @returns {Promise<Object>} Sign result
   */
  async [privateMethods.sign]() {
    await this[privateMethods.openApp]('sign');

    const { activeAccount, activeNet } = this[privateMethods.getSettings]();
    const res = await this.dialog.ask({
      method: METHODS.SIGN,
      url: window.location.origin,
      address: activeAccount,
      net: activeNet,
      request: this.currentRequest,
    });

    this.dialog.close();

    if (!res.status) throw new Error(res.message || 'Sign error!');

    return omit(res, ['status']);
  }

  /**
   * Recovers current request and returns recovered address
   * @public
   * @throws {Error} If recovery failed
   * @returns {Promise<String>} Recovered address
   */
  async [privateMethods.recover]() {
    const { activeAccount, activeNet } = this[privateMethods.getSettings]();
    const res = await this.bridge.ask({
      method: METHODS.RECOVER,
      address: activeAccount,
      net: activeNet,
      request: this.currentRequest,
    });

    if (!res.status) throw new Error(res.message || 'Recovery error!');

    return omit(res, ['status']);
  }

  // Public methods

  /**
   * Extends given provider for inner requests and returns it back
   * @public
   * @param {Web3.Provider} provider Web3-friendly provider
   * @returns {Web3.Provider} Inpage provider for injections into application
   *  Web3 instance
   */
  extendProvider(provider) {
    this[privateMethods.createRequestProvider](provider);
    // this[privateMethods.createInpageProvider](provider);

    return this.provider;
  }

  /**
   * Requests user settings from injected bridge and returns formatted data
   * Settings includes last active account and network id
   * @public
   * @throws {Error} If settings can not be resolved
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
   * method
   * @public
   * @param {String} options.activeAccount Currenct account checksummed address
   * @param {String} options.activeNet Active network ID
   */
  setProviderSettings(payload) {
    this.emitter.emit(INPAGE_EVENTS.SETTINGS, payload);
  }

  /**
   * Open application on auth screen and waits result (success of failure)
   * @public
   * @throws {Error} If authentification failed
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
   * Send request to logout through injected bridge bypass application dialog
   * @public
   * @throws {Error} If logout failed
   * @returns {Promise<Boolean>}
   */
  async logout() {
    const res = await this.bridge.ask({
      method: METHODS.LOGOUT,
    });

    if (!res.status) throw new Error(res.message || 'Logout error!');

    return res.status;
  }

  /**
   * Opens Endpass Connect appliction with user settings
   * If type of response equals to "logout" – user makes logout
   * If type of response equals to "update" – settings in injected provider will
   * be updated and promise will return updated settings
   * @public
   * @throws {Error} If update failed
   * @returns {Promise<Object>}
   */
  async openAccount() {
    await this[privateMethods.openApp]();

    const res = await this.dialog.ask({
      method: METHODS.ACCOUNT,
    });

    this.dialog.close();

    if (!res.status) throw new Error(res.message || 'Account updating failed!');

    if (res.type === 'update') {
      this.setProviderSettings(res.payload);

      return {
        type: 'update',
        payload: res.payload,
      };
    }

    return {
      type: res.type,
    };
  }
}

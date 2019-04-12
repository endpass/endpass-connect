import Network from '@endpass/class/Network';
import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import { Emmiter, InpageProvider, Bridge, ProviderFactory } from '@/class';
import {
  INPAGE_EVENTS,
  METHODS,
  DEFAULT_AUTH_URL,
  DIRECTION,
} from '@/constants';

import pkg from '../package.json';

const regAuthUrl = new RegExp('://auth(\\.|-)', 'ig');

export default class Context {
  /**
   * @param {String} options.authUrl Url of hosted Endpass Connect Application
   * @param {String} [options.namespace] namespace for see difference, between two instances
   * @param {Boolean} options.isIdentityMode isIdentityMode for define auth like identity
   * @param {Object} options.demoData demoData passed object to auth
   */
  constructor(options = {}) {
    const authUrl = options.authUrl || DEFAULT_AUTH_URL;

    this.authUrl =
      authUrl.search(regAuthUrl) === -1
        ? authUrl
        : authUrl.replace('://auth', `://auth${pkg.authVersion}`);

    this.namespace = options.namespace || '';

    this.haveDemoData = !!options.demoData;

    this.emitter = new Emmiter();
    const provider = new InpageProvider(this.emitter);
    this.setInpageProvider(provider);

    this.messenger = new CrossWindowMessenger({
      showLogs: !ENV.isProduction,
      name: `connect-bridge[${this.namespace}]`,
      to: DIRECTION.AUTH,
      from: DIRECTION.CONNECT,
    });

    this.requestProvider = ProviderFactory.createRequestProvider();

    this.isServerLogin = false;

    this.bridge = new Bridge({
      context: this,
      url: this.getConnectUrl('bridge'),
      initialPayload: {
        demoData: options.demoData,
        isIdentityMode: options.isIdentityMode || false,
      },
    });

    this.setupLoginEvents();
  }

  setupLoginEvents() {
    this.emitter.on(INPAGE_EVENTS.LOGIN, async () => {
      let error = null;
      if (!this.isLogin()) {
        try {
          await this.serverAuth();
        } catch (e) {
          error = new Error('Request data error');
        }
      }
      this.emitter.emit(INPAGE_EVENTS.LOGGED_IN, { error });
    });
  }

  async askDialog(params) {
    const { method, payload } = params;

    const bridge = this.getBridge();

    const res = await bridge.ask(method, payload);

    return res;
  }

  isLogin() {
    if (this.haveDemoData) {
      return true;
    }

    const { activeAccount } = this.getInpageProvider().settings;
    return !!(activeAccount && this.isServerLogin);
  }

  /**
   * Open application on auth screen and waits result (success of failure)
   * @public
   * @throws {Error} If authentification failed
   * @returns {Promise<boolean>} Auth result, check `status` property to
   *  know about result
   */
  async auth(redirectUrl = window.location.origin) {
    const res = await this.askDialog({
      method: METHODS.AUTH,
      payload: {
        redirectUrl,
      },
    });

    if (!res.status) throw new Error(res.error || 'Authentificaton error!');
    this.isServerLogin = true;

    const result = {
      payload: res.payload,
      status: res.status,
    };

    return result;
  }

  /**
   * Send request to logout through injected bridge bypass application dialog
   * @public
   * @throws {Error} If logout failed
   * @returns {Promise<Boolean>}
   */
  async logout() {
    const res = await this.getBridge().ask(METHODS.LOGOUT);

    if (!res.status) throw new Error(res.error || 'Logout error!');
    this.isServerLogin = false;

    return res.status;
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
      const { payload, status, error } = await this.getBridge().ask(
        METHODS.GET_SETTINGS,
      );

      if (!status) {
        throw new Error(error || 'User settings are not received!');
      }
      this.isServerLogin = true;

      const { settings = {} } = payload;

      return {
        activeAccount: settings.lastActiveAccount,
        activeNet: settings.net || Network.NET_ID.MAIN,
      };
    } catch (err) {
      throw new Error('User not authorized!');
    }
  }

  async serverAuth() {
    let settings;
    try {
      settings = await this.getAccountData();
    } catch (e) {
      await this.auth();
      settings = await this.getAccountData();
    }

    this.setProviderSettings(settings);
    this.isServerLogin = true;
  }

  setInpageProvider(provider) {
    this.inpageProvider = provider;
  }

  /**
   * Define Current request
   * @param {Web3.Provider} reqProvider Web3 provider instance
   */
  setRequestProvider(reqProvider) {
    this.requestProvider = reqProvider;
  }

  /**
   * Sets settings to current `web3` provider injected to page with `injectWeb3`
   * method
   * @param {String} options.activeAccount Currenct account checksummed address
   * @param {String} options.activeNet Active network ID
   */
  setProviderSettings(payload) {
    this.getEmitter().emit(INPAGE_EVENTS.SETTINGS, payload);
  }

  getInpageProvider() {
    return this.inpageProvider;
  }

  getRequestProvider() {
    return this.requestProvider;
  }

  /**
   * Returns injected provider settings
   * @private
   * @returns {Object} Current provider settings
   */
  getInpageProviderSettings() {
    return { ...this.getInpageProvider().settings };
  }

  /**
   * Returns connect application url with passed method
   * @private
   * @param {String} method Expected method (route)
   * @returns {String} Completed url to open
   */
  getConnectUrl(method) {
    const { authUrl } = this;
    return !method ? authUrl : `${authUrl}/${method}`;
  }

  getEmitter() {
    return this.emitter;
  }

  getBridge() {
    return this.bridge;
  }

  getMessenger() {
    return this.messenger;
  }

  getNamespace() {
    return this.namespace;
  }
}

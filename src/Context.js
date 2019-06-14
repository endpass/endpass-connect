import Network from '@endpass/class/Network';
import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import OauthPkceStrategy from '@/class/Oauth/OauthPkceStrategy';
import {
  Emmiter,
  InpageProvider,
  Bridge,
  ProviderFactory,
  Oauth,
  MessengerGroup,
} from '@/class';
import {
  INPAGE_EVENTS,
  METHODS,
  DEFAULT_AUTH_URL,
  DIRECTION,
} from '@/constants';

import pkg from '../package.json';

const authUrlRegexp = new RegExp('://auth(\\.|-)', 'ig');

export default class Context {
  /**
   * @param {String} options.oauthClientId OAuth client id
   * @param {String} [options.authUrl] Url of hosted Endpass Connect Application
   * @param {String} [options.namespace] namespace for see difference,
   *  between two instances
   * @param {Boolean} [options.isIdentityMode] isIdentityMode for define auth
   *  like identity
   * @param {Object} [options.demoData] demoData passed object to auth
   * @param {Object} [options.showCreateAccount] show create account form
   *  in auth dialog
   * @param {Object} [options.widget] Widget configuration object.
   *  If provided widget will be mounted automatically
   * @param {Object} [options.widget.position] Widget positions. By default
   *  equals to `bottom right`
   */
  constructor(options = {}) {
    if (!options.oauthClientId) {
      throw new Error('Connect library requires OAuth client id!');
    }
    const authUrl = options.authUrl || DEFAULT_AUTH_URL;

    /**
     * Independant class properties
     */
    this.inpageProvider = null;
    this.requestProvider = null;
    this.oauthRequestProvider = null;
    this.oauthClientId = options.oauthClientId;
    this.isServerLogin = false;
    this.authUrl = !authUrlRegexp.test(authUrl)
      ? authUrl
      : authUrl.replace('://auth', `://auth${pkg.authVersion}`);
    this.namespace = options.namespace || '';
    this.haveDemoData = !!options.demoData;
    this.widgetOptions = options.widget;

    /**
     * Inner abstractions initialization
     */
    this.emitter = new Emmiter();
    this.inpageProvider = new InpageProvider(this.emitter);
    this.requestProvider = ProviderFactory.createRequestProvider();
    this.messengerGroup = new MessengerGroup();
    this.dialogMessenger = new CrossWindowMessenger({
      showLogs: !ENV.isProduction,
      name: `connect-bridge-dialog[${this.namespace}]`,
      to: DIRECTION.AUTH,
      from: DIRECTION.CONNECT,
    });
    this.widgetMessenger = null;
    this.bridge = new Bridge({
      context: this,
      url: this.getConnectUrl('bridge'),
      initialPayload: {
        demoData: options.demoData,
        isIdentityMode: options.isIdentityMode || false,
        showCreateAccount: options.showCreateAccount,
      },
    });

    this.setupLoginEvents();

    this.messengerGroup.addMessenger(this.dialogMessenger);

    this.setupOnAuth();
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
  async auth(redirectUrl) {
    const toPath = redirectUrl || window.location.href;
    const res = await this.askDialog({
      method: METHODS.AUTH,
      payload: {
        redirectUrl: toPath,
      },
    });

    if (!res.status) throw new Error(res.error || 'Authentificaton error!');

    this.isServerLogin = true;

    return {
      payload: res.payload,
      status: res.status,
    };
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

    this.messengerGroup.send(METHODS.LOGOUT_RESPONSE);

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
      // FIXME: problem with e2e initialization here!
      const { payload, status, error } = await this.getBridge().ask(
        METHODS.GET_SETTINGS,
      );

      if (!status) {
        throw new Error(error || 'User settings are not received!');
      }

      const { settings = {} } = payload;
      const res = {
        activeAccount: settings.lastActiveAccount,
        activeNet: settings.net || Network.NET_ID.MAIN,
      };

      this.isServerLogin = true;
      this.setProviderSettings(res);

      return res;
    } catch (err) {
      throw new Error('User not authorized!');
    }
  }

  async serverAuth() {
    try {
      await this.getAccountData();
    } catch (e) {
      await this.auth();
      await this.getAccountData();
    }
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
    this.getEmitter().emit(INPAGE_EVENTS.SETTINGS, {
      activeAccount: payload.activeAccount,
      activeNet: payload.activeNet || Network.NET_ID.MAIN,
    });

    const settings = this.getInpageProviderSettings();
    this.messengerGroup.send(METHODS.CHANGE_SETTINGS_RESPONSE, settings);
  }

  /**
   * Fetch user data via oaurh
   * @param {Object} [params] Parameters object
   * @param {Number} [params.popupWidth] Oauth popup width
   * @param {Number} [params.popupHeight] Oauth popup height
   * @param {String[]} params.scopes - Array of authorization scopes
   */
  async loginWithOauth(params) {
    this.oauthRequestProvider = new Oauth({
      ...params,
      clientId: this.oauthClientId,
      strategy: OauthPkceStrategy,
    });
    await this.oauthRequestProvider.init();
  }

  /**
   * Makes api request with authorization token
   * @param {Object} [options] Request parameters object
   * @param {String} options.url Request url
   * @param {String} options.method Request http method
   * @param {Object} [options.params] - Request parameters
   * @param {Object} [options.headers] - Request headers
   * @param {Object|string} [options.data] - Request body
   * @returns {Promise} Request promise
   */
  request(options) {
    if (!this.oauthRequestProvider) {
      throw new Error('Request fail user is not authorized');
    }
    return this.oauthRequestProvider.request(options);
  }

  /**
   * Clears instance scopes and token
   * @throws {Error} If not authorized yet;
   */
  logoutFromOauth() {
    if (!this.oauthRequestProvider) {
      throw new Error('Logout failed: not logged in');
    }
    this.oauthRequestProvider.logout();
  }

  /**
   * Sets oauth popup parameters
   * @param {Object} params Parameters object
   * @param {Number} [params.width] Oauth popup width
   * @param {Number} [params.height] Oauth popup height
   * @throws {Error} If not authorized yet;
   */
  setOauthPopupParams(params) {
    if (!this.oauthRequestProvider) {
      throw new Error('Options setup failed: initialize instance first');
    }
    this.oauthRequestProvider.setPopupParams(params);
  }

  /**
   * @param {Object} [parameters]
   * @returns {Promise<Element>}
   */
  async mountWidget(parameters) {
    if (this.bridge.isWidgetMounted()) {
      return this.bridge.getWidgetNode();
    }

    this.widgetOptions = parameters;

    this.widgetMessenger = new CrossWindowMessenger({
      showLogs: !ENV.isProduction,
      name: `connect-bridge-widget[${this.namespace}]`,
      to: DIRECTION.AUTH,
      from: DIRECTION.CONNECT,
    });

    this.messengerGroup.addMessenger(this.widgetMessenger);

    return this.bridge.mountWidget(parameters);
  }

  unmountWidget() {
    if (!this.bridge.isWidgetMounted()) return;

    this.messengerGroup.removeMessenger(this.widgetMessenger);
    this.bridge.unmountWidget();
  }

  async getWidgetNode() {
    const res = await this.bridge.getWidgetNode();

    return res;
  }

  setupOnAuth() {
    setInterval(() => {
      if (this.widgetOptions !== false && this.isLogin()) {
        this.mountWidget(this.widgetOptions);
      }
    }, 1500);
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

  getDialogMessenger() {
    return this.dialogMessenger;
  }

  getWidgetMessenger() {
    return this.widgetMessenger;
  }

  getNamespace() {
    return this.namespace;
  }
}

import ConnectError from '@endpass/class/ConnectError';
import Network from '@endpass/class/Network';
import OauthPkceStrategy from '@/class/Oauth/OauthPkceStrategy';
import Emmiter from '@/class/Emmiter';
import InpageProvider from '@/class/InpageProvider';
import ProviderFactory from '@/class/ProviderFactory';
import Oauth from '@/class/Oauth';
import { INPAGE_EVENTS, METHODS } from '@/constants';
import BasicModules from '@/BasicModules';
import createStream from '@/streams';
import ProviderModule from '@/ProviderModule';
import OauthModule from '@/OauthModule';
import PluginManager from '@/plugins/PluginManager';

const { ERRORS } = ConnectError;

const WIDGET_AUTH_TIMEOUT = 1500;

const plugins = [BasicModules, ProviderModule, OauthModule];

export default class Context {
  /**
   * @param {string} options.oauthClientId OAuth client id
   * @param {string} [options.authUrl] Url of hosted Endpass Connect Application
   * @param {string} [options.namespace] namespace for see difference,
   *  between two instances
   * @param {boolean} [options.isIdentityMode] isIdentityMode for define auth
   *  like identity
   * @param {object} [options.demoData] demoData passed object to auth
   * @param {object} [options.showCreateAccount] show create account form
   *  in auth dialog
   * @param {object} [options.widget] Widget configuration object.
   *  If provided widget will be mounted automatically
   * @param {object} [options.widget.position] Widget positions. By default
   *  equals to `bottom right`
   */
  constructor(options = {}) {
    if (!options.oauthClientId) {
      throw ConnectError.create(ERRORS.OAUTH_REQUIRE_ID);
    }

    /**
     * Independent class properties
     */
    this.inpageProvider = null;
    this.requestProvider = null;
    this.oauthRequestProvider = null;
    this.oauthClientId = options.oauthClientId;
    this.haveDemoData = !!options.demoData;

    this.plugins = new PluginManager(this, plugins, options);
    this.plugins.init();

    this.emitter = new Emmiter();
    this.inpageProvider = new InpageProvider(this.emitter);
    this.requestProvider = ProviderFactory.createRequestProvider();

    // TODO: create state
    // this.state = {
    //   isPermission: false,
    //   isLogin: false,
    // };

    this.setupLoginEvents();
    this.setupWidgetOnAuth(options.widget);
    
    createStream(this);
  }

  setupLoginEvents() {
    this.emitter.on(INPAGE_EVENTS.LOGIN, async () => {
      let error = null;

      if (!this.isLogin) {
        try {
          await this.serverAuth();
        } catch (e) {
          error =
            e.code === ERRORS.AUTH_CANCELED_BY_USER
              ? e
              : ConnectError.create(ERRORS.REQUEST_DATA);
        }
      }

      this.emitter.emit(INPAGE_EVENTS.LOGGED_IN, { error });
    });
  }

  get isLogin() {
    if (this.haveDemoData) {
      return true;
    }

    return this.getAuthRequester().isLogin;
  }

  /**
   * Open application on auth screen and waits result (success of failure)
   * @public
   * @throws {Error} If authentification failed
   * @returns {Promise<boolean>} Auth result, check `status` property to
   *  know about result
   */
  auth(redirectUrl) {
    return this.getAuthRequester().auth(redirectUrl);
  }

  /**
   * Send request to logout through injected bridge bypass application dialog
   * @public
   * @throws {Error} If logout failed
   * @returns {Promise<Boolean>}
   */
  async logout() {
    const res = await this.getAuthRequester().logout();
    this.plugins.basicModules
      .getMessengerGroupInstance()
      .send(METHODS.LOGOUT_RESPONSE);
    return res;
  }

  /**
   * Requests user settings from injected bridge and returns formatted data
   * Settings includes last active account and network id
   * @public
   * @throws {Error} If settings can not be resolved
   * @returns {Promise<object>} Account data
   */
  async getAccountData() {
    try {
      const { payload, status, code } = await this.getDialog().ask(
        METHODS.GET_SETTINGS,
      );

      if (!status) {
        throw ConnectError.create(code || ERRORS.AUTH);
      }

      const { settings = {} } = payload;
      const res = {
        activeAccount: settings.lastActiveAccount,
        activeNet: settings.net || Network.NET_ID.MAIN,
      };

      this.setProviderSettings(res);

      return res;
    } catch (err) {
      console.error(err);
      throw ConnectError.create(err.code || ERRORS.USER_NOT_AUTHORIZED);
    }
  }

  async serverAuth() {
    try {
      await this.getAccountData();
    } catch (e) {
      if (e.code === ERRORS.AUTH_CANCELED_BY_USER) {
        throw ConnectError.create(ERRORS.AUTH_CANCELED_BY_USER);
      }

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
   * @param {object} payload
   * @param {string} payload.activeAccount Currenct account checksummed address
   * @param {string} payload.activeNet Active network ID
   */
  setProviderSettings(payload) {
    this.getEmitter().emit(INPAGE_EVENTS.SETTINGS, {
      activeAccount: payload.activeAccount,
      activeNet: payload.activeNet || Network.NET_ID.MAIN,
    });

    const settings = this.getInpageProviderSettings();
    this.plugins.basicModules
      .getMessengerGroupInstance()
      .send(METHODS.CHANGE_SETTINGS_RESPONSE, settings);
  }

  /**
   * Fetch user data via oaurh
   * @param {object} [params] Parameters object
   * @param {number} [params.popupWidth] Oauth popup width
   * @param {number} [params.popupHeight] Oauth popup height
   * @param {string[]} params.scopes - Array of authorization scopes
   */
  async loginWithOauth(params) {
    const strategy = new OauthPkceStrategy({
      dialog: this.getDialog(),
    });

    this.oauthRequestProvider = new Oauth({
      ...params,
      clientId: this.oauthClientId,
      strategy,
    });
    await this.oauthRequestProvider.init();
  }

  /**
   * Makes api request with authorization token
   * @param {object} [options] Request parameters object
   * @param {string} options.url Request url
   * @param {string} options.method Request http method
   * @param {object} [options.params] - Request parameters
   * @param {object} [options.headers] - Request headers
   * @param {object|string} [options.data] - Request body
   * @returns {Promise} Request promise
   */
  request(options) {
    if (!this.oauthRequestProvider) {
      throw ConnectError.create(ERRORS.OAUTH_REQUIRE_AUTHORIZE);
    }
    return this.oauthRequestProvider.request(options);
  }

  /**
   * Clears instance scopes and token
   * @throws {Error} If not authorized yet;
   */
  logoutFromOauth() {
    if (!this.oauthRequestProvider) {
      throw ConnectError.create(ERRORS.OAUTH_NOT_LOGGED_IN);
    }
    this.oauthRequestProvider.logout();
  }

  /**
   * Sets oauth popup parameters
   * @param {object} params Parameters object
   * @param {number} [params.width] Oauth popup width
   * @param {number} [params.height] Oauth popup height
   * @throws {Error} If not authorized yet;
   */
  setOauthPopupParams(params) {
    if (!this.oauthRequestProvider) {
      throw ConnectError.create(ERRORS.OAUTH_INITIALIZE_INSTANCE);
    }

    this.oauthRequestProvider.setPopupParams(params);
  }

  /**
   * @param {object} [parameters]
   * @returns {Promise<Element>}
   */
  async mountWidget(parameters) {
    clearInterval(this.widgetAutoMountTimerId);

    const frame = await this.getWidget().mount(parameters);
    return frame;
  }

  unmountWidget() {
    this.getWidget().unmount();
  }

  async getWidgetNode() {
    const res = await this.getWidget().getWidgetNode();

    return res;
  }

  setupWidgetOnAuth(options) {
    if (options === false) {
      return;
    }

    this.widgetAutoMountTimerId = setInterval(() => {
      if (this.isLogin) {
        this.mountWidget(options);
      }
    }, WIDGET_AUTH_TIMEOUT);
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
   * @returns {object} Current provider settings
   */
  getInpageProviderSettings() {
    return { ...this.getInpageProvider().settings };
  }

  getEmitter() {
    return this.emitter;
  }

  getDialog() {
    return this.plugins.basicModules.getDialogInstance();
  }

  getWidget() {
    return this.plugins.basicModules.getWidgetInstance();
  }

  getAuthRequester() {
    return this.plugins.basicModules.getAuthInstance();
  }
}

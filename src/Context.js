import ConnectError from '@endpass/class/ConnectError';
import Network from '@endpass/class/Network';
import OauthPkceStrategy from '@/class/Oauth/OauthPkceStrategy';
import {
  Emmiter,
  InpageProvider,
  Bridge,
  ProviderFactory,
  Oauth,
  MessengerGroup,
} from '@/class';
import { INPAGE_EVENTS, METHODS, DEFAULT_AUTH_URL } from '@/constants';

import pkg from '../package.json';
import createStream from '@/streams';
import Dialog from '@/class/Dialog';
import Widget from '@/class/Widget';

const { ERRORS } = ConnectError;

const authUrlRegexp = new RegExp('://auth(\\.|-)', 'ig');

const WIDGET_AUTH_TIMEOUT = 1500;

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
      throw ConnectError.create(ERRORS.OAUTH_REQUIRE_ID);
    }
    const authUrlRaw = options.authUrl || DEFAULT_AUTH_URL;

    /**
     * Independant class properties
     */
    this.inpageProvider = null;
    this.requestProvider = null;
    this.oauthRequestProvider = null;
    this.oauthClientId = options.oauthClientId;
    this.isServerLogin = false;
    const authUrl = !authUrlRegexp.test(authUrlRaw)
      ? authUrlRaw
      : authUrlRaw.replace('://auth', `://auth${pkg.authVersion}`);
    this.haveDemoData = !!options.demoData;
    this.widgetOptions = options.widget;

    const namespace = options.namespace || '';

    /**
     * Inner abstractions initialization
     */
    this.emitter = new Emmiter();
    this.inpageProvider = new InpageProvider(this.emitter);
    this.requestProvider = ProviderFactory.createRequestProvider();
    this.messengerGroup = new MessengerGroup();

    this.dialog = new Dialog({
      namespace,
      url: this.getConnectUrl(authUrl, 'bridge'),
    });
    this.widget = new Widget({
      namespace,
      url: this.getConnectUrl(authUrl, 'public/widget'),
    });

    this.bridge = new Bridge({
      context: this,
      dialog: this.dialog,
      widget: this.widget,
      initialPayload: {
        demoData: options.demoData,
        isIdentityMode: options.isIdentityMode || false,
        showCreateAccount: options.showCreateAccount,
      },
    });
    this.bridge.subscribeDialog();

    // TODO: create state
    // this.state = {
    //   isPermission: false,
    //   isLogin: false,
    // };

    this.setupLoginEvents();

    this.messengerGroup.addMessenger(this.bridge.dialog.getDialogMessenger());
    
    createStream(this);

    this.setupOnAuth();
  }

  /**
   * Returns connect application url with passed method
   * @private
   * @param {String} method Expected method (route)
   * @returns {String} Completed url to open
   */
  getConnectUrl(authUrl, method) {
    return !method ? authUrl : `${authUrl}/${method}`;
  }

  setupLoginEvents() {
    this.emitter.on(INPAGE_EVENTS.LOGIN, async () => {
      let error = null;

      if (!this.isLogin()) {
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

  async askDialog(params) {
    const { method, payload } = params;
    const dialog = this.getDialog();
    const res = await dialog.ask(method, payload);

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

    if (!res.status) {
      throw ConnectError.create(res.code || ERRORS.AUTH);
    }

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
    const res = await this.getDialog().ask(METHODS.LOGOUT);

    if (!res.status) {
      throw ConnectError.create(res.code || ERRORS.AUTH_LOGOUT);
    }

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

      this.isServerLogin = true;
      this.setProviderSettings(res);

      return res;
    } catch (err) {
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
    const strategy = new OauthPkceStrategy({
      dialog: this.dialog,
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
   * @param {Object} params Parameters object
   * @param {Number} [params.width] Oauth popup width
   * @param {Number} [params.height] Oauth popup height
   * @throws {Error} If not authorized yet;
   */
  setOauthPopupParams(params) {
    if (!this.oauthRequestProvider) {
      throw ConnectError.create(ERRORS.OAUTH_INITIALIZE_INSTANCE);
    }

    this.oauthRequestProvider.setPopupParams(params);
  }

  /**
   * @param {Object} [parameters]
   * @returns {Promise<Element>}
   */
  async mountWidget(parameters) {
    if (this.widget.isWidgetMounted()) {
      return this.widget.getWidgetNode();
    }

    clearInterval(this.widgetAutoMountTimerId);

    this.widgetOptions = parameters;
    this.widget.createMessenger();
    this.bridge.subscribeWidget();
    const frame = this.widget.mount(parameters);

    this.messengerGroup.addMessenger(this.widget.getWidgetMessenger());

    return frame;
  }

  unmountWidget() {
    if (!this.widget.isWidgetMounted()) return;

    this.messengerGroup.removeMessenger(this.widget.getWidgetMessenger());
    this.bridge.unsubscribeWidget();
    this.widget.unmount();
  }

  async getWidgetNode() {
    const res = await this.widget.getWidgetNode();

    return res;
  }

  setupOnAuth() {
    this.widgetAutoMountTimerId = setInterval(() => {
      if (this.widgetOptions !== false && this.isLogin()) {
        this.mountWidget(this.widgetOptions);
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
   * @returns {Object} Current provider settings
   */
  getInpageProviderSettings() {
    return { ...this.getInpageProvider().settings };
  }

  getEmitter() {
    return this.emitter;
  }

  getDialog() {
    return this.dialog;
  }
}

import ConnectError from '@endpass/class/ConnectError';
import Network from '@endpass/class/Network';
import OauthPkceStrategy from '@/class/Oauth/OauthPkceStrategy';
import {
  Emmiter,
  InpageProvider,
  ProviderFactory,
  Oauth,
  MessengerGroup,
  ElementsSubscriber,
  Dialog,
  Widget,
  Auth,
} from '@/class';
import { INPAGE_EVENTS, METHODS, DEFAULT_AUTH_URL } from '@/constants';

import pkg from '../package.json';
import createStream from '@/streams';

const { ERRORS } = ConnectError;

const authUrlRegexp = new RegExp('://auth(\\.|-)', 'ig');

const WIDGET_AUTH_TIMEOUT = 1500;

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
    const authUrlRaw = options.authUrl || DEFAULT_AUTH_URL;

    /**
     * Independant class properties
     */
    this.inpageProvider = null;
    this.requestProvider = null;
    this.oauthRequestProvider = null;
    this.oauthClientId = options.oauthClientId;
    this.authRequester = new Auth({
      context: this,
      haveDemoData: !!options.demoData,
    });
    const authUrl = !authUrlRegexp.test(authUrlRaw)
      ? authUrlRaw
      : authUrlRaw.replace('://auth', `://auth${pkg.authVersion}`);
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

    this.elementsSubscriber = new ElementsSubscriber({
      context: this,
      dialog: this.dialog,
      widget: this.widget,
      initialPayload: {
        demoData: options.demoData,
        isIdentityMode: options.isIdentityMode || false,
        showCreateAccount: options.showCreateAccount,
      },
    });
    this.elementsSubscriber.subscribeDialog();

    // TODO: create state
    // this.state = {
    //   isPermission: false,
    //   isLogin: false,
    // };

    this.setupLoginEvents();

    this.messengerGroup.addMessenger(this.dialog.getDialogMessenger());
    
    createStream(this);

    this.setupOnAuth();
  }

  /**
   * Returns connect application url with passed method
   * @private
   * @param {string} method Expected method (route)
   * @returns {string} Completed url to open
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

  /**
   *
   * @param {string} method method call
   * @param {object=} [payload] payload payload
   * @return {Promise<any>}
   */
  async askDialog(method, payload) {
    const res = await this.getDialog().ask(method, payload);

    return res;
  }

  isLogin() {
    return this.authRequester.isLogin();
  }

  /**
   * Open application on auth screen and waits result (success of failure)
   * @public
   * @throws {Error} If authentification failed
   * @returns {Promise<boolean>} Auth result, check `status` property to
   *  know about result
   */
  auth(redirectUrl) {
    return this.authRequester.auth(redirectUrl);
  }

  /**
   * Send request to logout through injected bridge bypass application dialog
   * @public
   * @throws {Error} If logout failed
   * @returns {Promise<Boolean>}
   */
  async logout() {
    const res = await this.authRequester.logout();
    this.messengerGroup.send(METHODS.LOGOUT_RESPONSE);
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

      this.authRequester.isServerLogin = true;
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
    this.messengerGroup.send(METHODS.CHANGE_SETTINGS_RESPONSE, settings);
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
    if (this.widget.isWidgetMounted()) {
      return this.widget.getWidgetNode();
    }

    clearInterval(this.widgetAutoMountTimerId);

    this.widgetOptions = parameters;
    this.widget.createMessenger();
    this.elementsSubscriber.subscribeWidget();
    const frame = this.widget.mount(parameters);

    this.messengerGroup.addMessenger(this.widget.getWidgetMessenger());

    return frame;
  }

  unmountWidget() {
    if (!this.widget.isWidgetMounted()) return;

    this.messengerGroup.removeMessenger(this.widget.getWidgetMessenger());
    this.elementsSubscriber.unsubscribeWidget();
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
   * @returns {object} Current provider settings
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

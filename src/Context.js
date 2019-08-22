import ConnectError from '@endpass/class/ConnectError';
import { METHODS } from '@/constants';
import createStream from '@/streams';
import PluginManager from '@/PluginManager';

import ElementsPlugin from '@/plugins/ElementsPlugin';
import ProviderPlugin from '@/plugins/ProviderPlugin';
import OauthPlugin from '@/plugins/OauthPlugin';
import AuthPlugin from '@/plugins/AuthPlugin';

const { ERRORS } = ConnectError;

const plugins = [ElementsPlugin, ProviderPlugin, OauthPlugin, AuthPlugin];

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
    /**
     * Independent class properties
     */

    this.plugins = PluginManager.createPlugins(this, plugins, options);
    PluginManager.init(this.plugins);

    // TODO: create state
    // this.state = {
    //   isPermission: false,
    //   isLogin: false,
    // };

    createStream(this);
  }

  get isLogin() {
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
    this.plugins.elements
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
    return this.plugins.provider.getAccountData();
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
    this.plugins.provider.setRequestProvider(reqProvider);
  }

  /**
   * Sets settings to current `web3` provider injected to page with `injectWeb3`
   * method
   * @param {object} payload
   * @param {string} payload.activeAccount Currenct account checksummed address
   * @param {string} payload.activeNet Active network ID
   */
  setProviderSettings(payload) {
    this.plugins.provider.setProviderSettings(payload);

    const settings = this.getInpageProviderSettings();
    this.plugins.elements
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
    await this.plugins.oauth.loginWithOauth(params);
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
    return this.plugins.oauth.request(options);
  }

  /**
   * Clears instance scopes and token
   * @throws {Error} If not authorized yet;
   */
  logoutFromOauth() {
    this.plugins.oauth.logoutFromOauth();
  }

  /**
   * Sets oauth popup parameters
   * @param {object} params Parameters object
   * @param {number} [params.width] Oauth popup width
   * @param {number} [params.height] Oauth popup height
   * @throws {Error} If not authorized yet;
   */
  setOauthPopupParams(params) {
    this.plugins.oauth.setOauthPopupParams(params);
  }

  /**
   * @param {object} [parameters]
   * @returns {Promise<Element>}
   */
  async mountWidget(parameters) {
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

  getInpageProvider() {
    return this.plugins.provider.getInpageProvider();
  }

  getRequestProvider() {
    return this.plugins.provider.getRequestProvider();
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
    return this.plugins.provider.getEmitter();
  }

  getDialog() {
    return this.plugins.elements.getDialogInstance();
  }

  getWidget() {
    return this.plugins.elements.getWidgetInstance();
  }

  getAuthRequester() {
    return this.plugins.auth.getAuthInstance();
  }
}

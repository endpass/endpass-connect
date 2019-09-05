import ConnectError from '@endpass/class/ConnectError';
import Context from '@/class/Context';
import { METHODS } from '@/constants';

const { ERRORS } = ConnectError;

export default class PluginBase {
  constructor(options = {}, context) {
    // child mode
    if (context) {
      this.context = context;
      return;
    }

    // singleton mode
    this.context = new Context(
      {
        ...options,
        plugins: [...options.plugins, ...this.constructor.dependencyPlugins],
      },
      this,
    );
  }

  static get pluginName() {
    throw new Error('Please define plugin name');
  }

  static get dependencyPlugins() {
    return [];
  }

  handleEvent() {}

  get subscribeData() {
    return [];
  }

  // public api

  /**
   * Sets settings to current `web3` provider injected to page with `injectWeb3`
   * method
   * @public
   * @param {object} payload
   * @param {string} payload.activeAccount Current account check summed address
   * @param {string} payload.activeNet Active network ID
   */
  setProviderSettings(payload) {
    this.context.setProviderSettings(payload);
  }

  /**
   * Requests user settings from injected bridge and returns formatted data
   * Settings includes last active account and network id
   * @public
   * @throws {Error} If settings can not be resolved
   * @returns {Promise<object>} Account data
   */
  async getAccountData() {
    await this.auth();
    return this.context.plugins.provider.getProviderAccountData();
  }

  /**
   * Return Inpage provider for inner requests and returns it back
   * @public
   * @param {Web3.Provider} provider Web3-friendly provider
   * @returns {Web3.Provider} Inpage provider for injections into application
   *  Web3 instance
   */
  getProvider() {
    return this.context.plugins.provider.getInpageProvider();
  }

  /**
   * Open application on auth screen and waits result (success of failure)
   * @throws {Error} If authentication failed
   * @returns {Promise<boolean>} Auth result, check `status` property to
   *  know about result
   */
  async auth(redirectUrl) {
    const res = await this.context.handleRequest(
      METHODS.INTERNAL_AUTH,
      redirectUrl,
    );

    return {
      ...res.payload,
      status: res.status,
    };
  }

  /**
   * Send request to logout through injected bridge bypass application dialog
   * @private
   * @throws {Error} If logout failed
   * @returns {Promise<boolean>}
   */
  async logout() {
    const { status } = await this.context.handleRequest(METHODS.LOGOUT_REQUEST);
    return status;
  }

  /**
   * Opens Endpass Connect application with user settings
   * If type of response equals to "logout" – user makes logout
   * If type of response equals to "update" – settings in injected provider will
   * be updated and promise will return updated settings
   * @public
   * @throws {Error} If update failed
   * @returns {Promise<object>}
   */
  async openAccount() {
    await this.auth();
    return this.context.plugins.provider.openProviderAccount();
  }

  /**
   * Fetch user data via oauth
   * @param {object} params Parameters object
   * @param {number} [params.popupWidth] Oauth popup width
   * @param {number} [params.popupHeight] Oauth popup height
   * @param {string[]} params.scopes - Array of authorization scopes
   */
  async loginWithOauth(params) {
    await this.context.plugins.oauth.loginWithOauth(params);
  }

  /**
   * Clears instance scopes and token
   * @throws {Error} If not authorized yet;
   */
  logoutFromOauth() {
    const { oauth } = this.context.plugins;
    if (!oauth.oauthRequestProvider) {
      throw ConnectError.create(ERRORS.OAUTH_NOT_LOGGED_IN);
    }

    oauth.oauthRequest.logout();
  }

  /**
   * Sets oauth popup parameters
   * @param {object} params Parameters object
   * @param {number} [params.width] Oauth popup width
   * @param {number} [params.height] Oauth popup height
   * @throws {Error} If not authorized yet;
   */
  setOauthPopupParams(params) {
    this.context.plugins.oauth.oauthRequest.setPopupParams(params);
  }

  /**
   * Fetch user data via oauth
   * @param {object} [options] Request parameters object
   * @param {string} options.url Request url
   * @param {string} options.method Request http method
   * @param {object} [options.params] - Request parameters
   * @param {object} [options.headers] - Request headers
   * @param {object|string} [options.data] - Request body
   * @returns {Promise} Request promise
   * @throws {Error} If not authorized yet;
   */
  request(options) {
    return this.context.plugins.oauth.oauthRequest.request(options);
  }

  /**
   * Mounts endpass widget
   * @param {object} [params] Parameters object
   * @param {object} [params.position] Position of mounting widget
   * @param {object} [params.position.left]
   * @param {object} [params.position.right]
   * @param {object} [params.position.top]
   * @param {object} [params.position.bottom]
   * @returns {Promise<Element>} Mounted widget iframe element
   */
  mountWidget(params) {
    return this.context.plugins.widget.widget.mount(params);
  }

  /**
   * Unmounts endpass widget from DOM
   */
  unmountWidget() {
    this.context.plugins.widget.widget.unmount();
  }

  /**
   * Returns widget iframe element when it available
   * @returns {Promise<Element>} Widget iframe node
   */
  async getWidgetNode() {
    const res = await this.context.plugins.widget.widget.getWidgetNode();

    return res;
  }
}

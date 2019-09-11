import Context from '@/class/Context';
import {
  PLUGIN_METHODS,
  MESSENGER_METHODS,
  CONTEXT as context,
} from '@/constants';
import pkg from '../../package.json';

// OLD CONNECT
export default class PluginApiTrait {
  constructor(options, ClassPlugin) {
    this[context] = new Context(options, ClassPlugin);
    if (ENV.isProduction) {
      /* eslint-disable-next-line */
      console.info(
        `%cEndpass connect:${ClassPlugin.pluginName} version ${pkg.version} created 🔌`,
        'color: #fff; background: #4B0873',
      );
    }
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
    return this[context].plugins.provider.openProviderAccount();
  }

  /**
   * Sets settings to current `web3` provider injected to page with `injectWeb3`
   * method
   * @public
   * @param {object} payload
   * @param {string} payload.activeAccount Current account check summed address
   * @param {string} payload.activeNet Active network ID
   */
  async setProviderSettings(payload) {
    return this[context].executeMethod(
      PLUGIN_METHODS.CONTEXT_SET_PROVIDER_SETTINGS,
      payload,
    );
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
    const res = await this[context].plugins.provider.getProviderAccountData();
    return res;
  }

  /**
   * Return Inpage provider for inner requests and returns it back
   * @public
   * @param {Web3.Provider} provider Web3-friendly provider
   * @returns {Promise<Web3.Provider>} Inpage provider for injections into application
   *  Web3 instance
   */
  async getProvider() {
    return this[context].plugins.provider.getInpageProvider();
  }

  /**
   * Open application on auth screen and waits result (success of failure)
   * @throws {Error} If authentication failed
   * @returns {Promise<boolean>} AuthorizePlugin result, check `status` property to
   *  know about result
   */
  async auth(redirectUrl) {
    const res = await this[context].executeMethod(
      PLUGIN_METHODS.CONTEXT_AUTHORIZE,
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
    const { status } = await this[context].executeMethod(
      MESSENGER_METHODS.LOGOUT_REQUEST,
    );
    return status;
  }

  /**
   * Fetch user data via oauth
   * @param {object} params Parameters object
   * @param {number} [params.popupWidth] Oauth popup width
   * @param {number} [params.popupHeight] Oauth popup height
   * @param {string[]} params.scopes - Array of authorization scopes
   */
  async loginWithOauth(params) {
    await this[context].plugins.oauth.loginWithOauth(params);
  }

  /**
   * Clears instance scopes and token
   * @throws {Error} If not authorized yet;
   */
  async logoutFromOauth() {
    this[context].plugins.oauth.logout();
  }

  /**
   * Sets oauth popup parameters
   * @param {object} params Parameters object
   * @param {number} [params.width] Oauth popup width
   * @param {number} [params.height] Oauth popup height
   * @throws {Error} If not authorized yet;
   */
  async setOauthPopupParams(params) {
    this[context].plugins.oauth.setPopupParams(params);
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
  async request(options) {
    return this[context].plugins.oauth.request(options);
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
  async mountWidget(params) {
    return this[context].executeMethod(
      PLUGIN_METHODS.CONTEXT_MOUNT_WIDGET,
      params,
    );
  }

  /**
   * Unmounts endpass widget from DOM
   */
  async unmountWidget() {
    return this[context].executeMethod(MESSENGER_METHODS.WIDGET_UNMOUNT);
  }

  /**
   * Returns widget iframe element when it available
   * @returns {Promise<Element>} Widget iframe node
   */
  async getWidgetNode() {
    const res = await this[context].plugins.widget.getWidgetNode();

    return res;
  }
}

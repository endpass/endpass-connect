import Context from '@/Context';
import privateFields from '@/privateFields';

import pkg from '../package.json';

if (ENV.isProduction) {
  /* eslint-disable-next-line */
  console.info(
    `%cEndpass connect version ${pkg.version} loaded 🔌`,
    'color: #fff; background: #4B0873',
  );
}

export default class Connect {
  /**
   * @param {string} options.authUrl Url of hosted Endpass Connect Application
   * @param {string} options.oauthClientId OAuth client id
   * @param {object|boolean} [options.widget] Widget parameters. Pass false to
   *  prevent widget mounting
   */
  constructor(options) {
    this[privateFields.context] = new Context(options);
  }

  /**
   * Sets settings to current `web3` provider injected to page with `injectWeb3`
   * method
   * @public
   * @param {object} payload
   * @param {string} payload.activeAccount Current account check summed address
   * @param {string} payload.activeNet Active network ID
   */
  setProviderSettings(payload) {
    this[privateFields.context].setProviderSettings(payload);
  }

  /**
   * Requests user settings from injected bridge and returns formatted data
   * Settings includes last active account and network id
   * @public
   * @throws {Error} If settings can not be resolved
   * @returns {Promise<object>} Account data
   */
  async getAccountData() {
    return this[privateFields.context].getAccountData();
  }

  /**
   * Return Inpage provider for inner requests and returns it back
   * @public
   * @param {Web3.Provider} provider Web3-friendly provider
   * @returns {Web3.Provider} Inpage provider for injections into application
   *  Web3 instance
   */
  getProvider() {
    return this[privateFields.context].getInpageProvider();
  }

  /**
   * Open application on auth screen and waits result (success of failure)
   * @public
   * @throws {Error} If authentification failed
   * @returns {Promise<boolean>} Auth result, check `status` property to
   *  know about result
   */
  async auth(redirectUrl) {
    const res = await this[privateFields.context].auth(redirectUrl);

    return {
      ...res.payload,
      status: res.status,
    };
  }

  /**
   * Send request to logout through injected bridge bypass application dialog
   * @public
   * @throws {Error} If logout failed
   * @returns {Promise<boolean>}
   */
  async logout() {
    return this[privateFields.context].logout();
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
    return this[privateFields.context].plugins.provider.openAccount();
  }

  /**
   * Fetch user data via oauth
   * @param {object} params Parameters object
   * @param {number} [params.popupWidth] Oauth popup width
   * @param {number} [params.popupHeight] Oauth popup height
   * @param {string[]} params.scopes - Array of authorization scopes
   */
  async loginWithOauth(params) {
    await this[privateFields.context].plugins.oauth.loginWithOauth(params);
  }

  /**
   * Clears instance scopes and token
   * @throws {Error} If not authorized yet;
   */
  logoutFromOauth() {
    this[privateFields.context].plugins.oauth.logoutFromOauth();
  }

  /**
   * Sets oauth popup parameters
   * @param {object} params Parameters object
   * @param {number} [params.width] Oauth popup width
   * @param {number} [params.height] Oauth popup height
   * @throws {Error} If not authorized yet;
   */
  setOauthPopupParams(params) {
    this[privateFields.context].plugins.oauth.setOauthPopupParams(params);
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
    return this[privateFields.context].plugins.oauth.request(options);
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
    return this[privateFields.context].plugins.elements
      .getWidgetInstance()
      .mount(params);
  }

  /**
   * Unmounts endpass widget from DOM
   */
  unmountWidget() {
    this[privateFields.context].plugins.elements.getWidgetInstance().unmount();
  }

  /**
   * Returns widget iframe element when it available
   * @returns {Promise<Element>} Widget iframe node
   */
  async getWidgetNode() {
    const res = await this[privateFields.context].plugins.elements
      .getWidgetInstance()
      .getWidgetNode();

    return res;
  }
}

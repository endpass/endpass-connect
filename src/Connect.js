import Context from '@/Context';
import privateFields from '@/privateFields';
import { METHODS } from '@/constants';

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
   * @param {String} options.authUrl Url of hosted Endpass Connect Application
   * @param {Object|Boolean} [options.widget] Widget parameters. Pass false to
   *  prevent widget mounting
   */
  constructor(options) {
    this[privateFields.context] = new Context(options);
  }

  /**
   * Sets settings to current `web3` provider injected to page with `injectWeb3`
   * method
   * @public
   * @param {String} options.activeAccount Currenct account checksummed address
   * @param {String} options.activeNet Active network ID
   */
  setProviderSettings(payload) {
    this[privateFields.context].setProviderSettings(payload);
  }

  /**
   * Requests user settings from injected bridge and returns formatted data
   * Settings includes last active account and network id
   * @public
   * @throws {Error} If settings can not be resolved
   * @returns {Promise<Object>} Account data
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
   * @returns {Promise<Boolean>}
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
   * @returns {Promise<Object>}
   */
  async openAccount() {
    const context = this[privateFields.context];
    const res = await context.askDialog({
      method: METHODS.ACCOUNT,
    });

    if (!res.status) throw new Error(res.error || 'Account updating failed!');

    const { type, settings } = res.payload;

    if (type === 'update') {
      this.setProviderSettings(settings);

      return {
        type,
        settings,
      };
    }

    return {
      type,
    };
  }

  /**
   * Fetch user data via oauth
   * @param {Object} params Parameters object
   * @param {Number} [params.popupWidth] Oauth popup width
   * @param {Number} [params.popupHeight] Oauth popup height
   * @param {String[]} params.scopes - Array of authorization scopes
   */
  async loginWithOauth(params) {
    await this[privateFields.context].loginWithOauth(params);
  }

  logoutFromOauth() {
    this[privateFields.context].logoutFromOauth();
  }

  /**
   * Sets oauth popup parameters
   * @param {Object} params Parameters object
   * @param {Number} [params.width] Oauth popup width
   * @param {Number} [params.height] Oauth popup height
   * @throws {Error} If not authorized yet;
   */
  setOauthPopupParams(params) {
    this[privateFields.context].setOauthPopupParams(params);
  }

  /**
   * Fetch user data via oauth
   * @param {Object} [options] Request parameters object
   * @param {String} options.url Request url
   * @param {String} options.method Request http method
   * @param {Object} [options.params] - Request parameters
   * @param {Object} [options.headers] - Request headers
   * @param {Object|string} [options.data] - Request body
   * @returns {Promise} Request promise
   * @throws {Error} If not authorized yet;
   */
  request(options) {
    return this[privateFields.context].request(options);
  }

  /**
   * Mounts endpass widget
   * @param {Object} [params] Parameters object
   * @param {Object} [params.position] Position of mounting widget
   * @param {Object} [params.position.left]
   * @param {Object} [params.position.right]
   * @param {Object} [params.position.top]
   * @param {Object} [params.position.bottom]
   * @returns {Promise<Element>} Mounted widget iframe element
   */
  mountWidget(params) {
    return this[privateFields.context].mountWidget(params);
  }

  /**
   * Unmounts endpass widget from DOM
   */
  unmountWidget() {
    this[privateFields.context].unmountWidget();
  }

  /**
   * Returns widget iframe element when it available
   * @returns {Promise<Element>} Widget iframe node
   */
  async getWidgetNode() {
    const res = await this[privateFields.context].getWidgetNode();

    return res;
  }
}

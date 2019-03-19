import Context from '@/Context';
import privateFields from '@/privateFields';
import Queue from '@/Queue';
import { METHODS } from '@/constants';
import middleware from '@/middleware';
import Dialog from '@/class/Dialog';

import pkg from '../package.json';

if (ENV.isProduction) {
  console.info(
    `%cEndpass connect version ${pkg.version} loaded 🔌`,
    'color: #fff; background: #4B0873',
  );
}

export default class Connect {
  /**
   * @param {String} options.authUrl Url of hosted Endpass Connect Application
   */
  constructor(options) {
    const context = new Context(options);
    this[privateFields.queue] = new Queue(context, { middleware });
    this[privateFields.context] = context;
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

    const params = Dialog.createParams({
      method: METHODS.ACCOUNT,
    });
    const res = await context.askDialog(params);

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
}

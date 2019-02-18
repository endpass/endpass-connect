import Web3HttpProvider from 'web3-providers-http';
import Context from '@/Context';
import Providers from '@/Providers';
import privateFields from '@/privateFields';
import Queue from '@/Queue';
import { METHODS, INPAGE_EVENTS } from '@/constants';
import middleWares from '@/middlewares';

import pkg from '../../package.json';

console.info(
  `%cEndpass connect version ${pkg.version} loaded 🔌`,
  'color: #fff; background: #4B0873',
);

export default class Connect {
  /**
   * @param {String} options.authUrl Url of hosted Endpass Connect Application
   */
  constructor(options) {
    const context = new Context(options);
    this[privateFields.providers] = new Providers(context);
    this[privateFields.queue] = new Queue(context, { middleWares });
    this[privateFields.context] = context;

    this[privateFields.providers].createRequestProvider(Web3HttpProvider);
  }

  /**
   * Sets settings to current `web3` provider injected to page with `injectWeb3`
   * method
   * @public
   * @param {String} options.activeAccount Currenct account checksummed address
   * @param {String} options.activeNet Active network ID
   */
  setProviderSettings(payload) {
    this[privateFields.context]
      .getEmitter()
      .emit(INPAGE_EVENTS.SETTINGS, payload);
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
      const settings = await this[privateFields.context].getBridge().ask({
        method: METHODS.GET_SETTINGS,
      });

      if (!settings.status) {
        throw new Error(settings.message || 'User settings are not received!');
      }

      return {
        activeAccount: settings.lastActiveAccount,
        activeNet: settings.net,
      };
    } catch (err) {
      throw new Error('User not autorized!');
    }
  }

  /**
   * Extends given provider for inner requests and returns it back
   * @deprecated
   * @public
   * @param {Web3.Provider} provider Web3-friendly provider
   * @returns {Web3.Provider} Inpage provider for injections into application
   *  Web3 instance
   */
  extendProvider(provider) {
    // this[privateFields.providers].createRequestProvider(provider);
    // this[privateFields.providers]createInpageProvider(provider);

    return this[privateFields.context].getProvider();
  }

  /**
   * Return Inpage provider for inner requests and returns it back
   * @public
   * @param {Web3.Provider} provider Web3-friendly provider
   * @returns {Web3.Provider} Inpage provider for injections into application
   *  Web3 instance
   */
  getProvider() {
    return this[privateFields.context].getProvider();
  }

  /**
   * Open application on auth screen and waits result (success of failure)
   * @public
   * @throws {Error} If authentification failed
   * @returns {Promise<boolean>} Auth result, check `status` property to
   *  know about result
   */
  async auth(redirectUrl) {
    return this[privateFields.context].auth(redirectUrl);
  }

  /**
   * Send request to logout through injected bridge bypass application dialog
   * @public
   * @throws {Error} If logout failed
   * @returns {Promise<Boolean>}
   */
  async logout() {
    const res = await this[privateFields.context].getBridge().ask({
      method: METHODS.LOGOUT,
    });

    if (!res.status) throw new Error(res.message || 'Logout error!');

    return res.status;
  }

  /**
   * Opens Endpass Connect appliction with user settings
   * If type of response equals to "logout" – user makes logout
   * If type of response equals to "update" – settings in injected provider will
   * be updated and promise will return updated settings
   * @public
   * @throws {Error} If update failed
   * @returns {Promise<Object>}
   */
  async openAccount() {
    const context = this[privateFields.context];
    await context.openApp();

    const dialog = context.getDialog();

    const res = await dialog.ask({
      method: METHODS.ACCOUNT,
    });

    dialog.close();

    if (!res.status) throw new Error(res.message || 'Account updating failed!');

    if (res.type === 'update') {
      this.setProviderSettings(res.payload);

      return {
        type: 'update',
        payload: res.payload,
      };
    }

    return {
      type: res.type,
    };
  }
}

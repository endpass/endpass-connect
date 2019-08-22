import ConnectError from '@endpass/class/ConnectError';
import Network from '@endpass/class/Network';
import Plugin from '@/plugins/Plugin';
import Emmiter from '@/class/Emmiter';
import InpageProvider from '@/class/InpageProvider';
import { INPAGE_EVENTS, METHODS } from '@/constants';
import ProviderFactory from '@/class/ProviderFactory';
import createInpageProviderStream from '@/streams/inpageProvider/inpageProviderStream';

const { ERRORS } = ConnectError;

export default class ProviderPlugin extends Plugin {
  static pluginName() {
    return 'provider';
  }

  init() {
    createInpageProviderStream(this.context);

    this.getEmitter().on(INPAGE_EVENTS.LOGIN, async () => {
      let error = null;

      if (!this.context.isLogin) {
        try {
          await this.context.serverAuth();
        } catch (e) {
          error =
            e.code === ERRORS.AUTH_CANCELED_BY_USER
              ? e
              : ConnectError.create(ERRORS.REQUEST_DATA);
        }
      }

      this.getEmitter().emit(INPAGE_EVENTS.LOGGED_IN, { error });
    });
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
      const { payload, status, code } = await this.context
        .getDialog()
        .ask(METHODS.GET_SETTINGS);

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
  }

  /**
   * Define Current request
   * @param {Web3.Provider} reqProvider Web3 provider instance
   */
  setRequestProvider(reqProvider) {
    this.requestProvider = reqProvider;
  }

  getRequestProvider() {
    if (!this.requestProvider) {
      this.requestProvider = ProviderFactory.createRequestProvider();
    }

    return this.requestProvider;
  }

  getInpageProvider() {
    if (!this.inpageProvider) {
      this.inpageProvider = new InpageProvider(this.getEmitter());
    }

    return this.inpageProvider;
  }

  getEmitter() {
    if (!this.emitter) {
      this.emitter = new Emmiter();
    }
    return this.emitter;
  }

  /**
   * Returns injected provider settings
   * @private
   * @returns {object} Current provider settings
   */
  getInpageProviderSettings() {
    return { ...this.getInpageProvider().settings };
  }
}

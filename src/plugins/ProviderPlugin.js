import ConnectError from '@endpass/class/ConnectError';
import Network from '@endpass/class/Network';
import Emmiter from '@/class/Emmiter';
import InpageProvider from '@/class/InpageProvider';
import { INPAGE_EVENTS, METHODS } from '@/constants';
import ProviderFactory from '@/class/ProviderFactory';
import createInpageProviderStream from '@/streams/inpageProvider/inpageProviderStream';
import PluginBase from './PluginBase';

const { ERRORS } = ConnectError;

export default class ProviderPlugin extends PluginBase {
  constructor(props) {
    super(props);

    this.getEmitter().on(INPAGE_EVENTS.LOGIN, async () => {
      let error = null;

      if (!this.context.isLogin) {
        try {
          await this.serverAuth();
        } catch (e) {
          error =
            e.code === ERRORS.AUTH_CANCELED_BY_USER
              ? e
              : ConnectError.create(ERRORS.REQUEST_DATA);
        }
      }

      this.getEmitter().emit(INPAGE_EVENTS.LOGGED_IN, { error });
    });

    createInpageProviderStream(this.getEmitter(), this.context);
  }

  static get pluginName() {
    return 'provider';
  }

  /**
   *
   * @return {Promise<object>}
   */
  async openAccount() {
    const res = await this.context.getDialog().ask(METHODS.ACCOUNT);

    if (!res.status) {
      throw ConnectError.create(res.code || ERRORS.ACCOUNT_UPDATE);
    }

    const { type, settings } = res.payload;

    if (type === 'update') {
      this.context.setProviderSettings(settings);

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

      this.context.setProviderSettings(res);

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

  /**
   *
   * @return {Web3.Provider|Web3HttpProvider}
   */
  getRequestProvider() {
    if (!this.requestProvider) {
      this.requestProvider = ProviderFactory.createRequestProvider();
    }

    return this.requestProvider;
  }

  /**
   *
   * @return {InpageProvider}
   */
  getInpageProvider() {
    if (!this.inpageProvider) {
      this.inpageProvider = new InpageProvider(this.getEmitter());
    }

    return this.inpageProvider;
  }

  /**
   *
   * @return {Emitter}
   */
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

  async serverAuth() {
    try {
      await this.getAccountData();
    } catch (e) {
      if (e.code === ERRORS.AUTH_CANCELED_BY_USER) {
        throw ConnectError.create(ERRORS.AUTH_CANCELED_BY_USER);
      }

      await this.context.auth();
      await this.getAccountData();
    }
  }
}

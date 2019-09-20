import ConnectError from '@endpass/class/ConnectError';
import Network from '@endpass/class/Network';
import Emmiter from '@/plugins/ProviderPlugin/Emmiter';
import InpageProvider from '@/plugins/ProviderPlugin/InpageProvider';
import {
  INPAGE_EVENTS,
  MESSENGER_METHODS,
  PLUGIN_METHODS,
  PLUGIN_NAMES,
} from '@/constants';
import ProviderFactory from '@/plugins/ProviderPlugin/ProviderFactory';
import createInpageProviderStream from '@/streams/inpageProvider/inpageProviderStream';
import PluginBase from '../PluginBase';
import { WidgetPlugin } from '../WidgetPlugin';
import { AuthorizePlugin } from '../AuthorizePlugin';
import { DialogPlugin } from '@/plugins/DialogPlugin';
import { MessengerGroupPlugin } from '@/plugins/MessengerGroupPlugin';
import ProviderApi from '@/plugins/ProviderPlugin/ProviderPublicApi';

const { ERRORS } = ConnectError;

export default class ProviderPlugin extends PluginBase {
  static get dependencyPlugins() {
    return [DialogPlugin, AuthorizePlugin, WidgetPlugin, MessengerGroupPlugin];
  }

  static get pluginName() {
    return PLUGIN_NAMES.PROVIDER;
  }

  static get publicApi() {
    return ProviderApi;
  }

  constructor(options, context) {
    super(options, context);

    this.emitter = new Emmiter();
  }

  init() {
    this.emitter.on(INPAGE_EVENTS.LOGIN, async () => {
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

      this.emitter.emit(INPAGE_EVENTS.LOGGED_IN, { error });
    });

    createInpageProviderStream(this.context, this);
  }

  /**
   *
   * @return {Promise<object>}
   */
  async openProviderAccount() {
    const res = await this.context.ask(MESSENGER_METHODS.ACCOUNT);

    if (!res.status) {
      throw ConnectError.create(res.code || ERRORS.ACCOUNT_UPDATE);
    }

    const { type, settings } = res.payload;

    if (type === 'update') {
      await this.context.executeMethod(
        PLUGIN_METHODS.CONTEXT_SET_PROVIDER_SETTINGS,
        settings,
      );

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
  async getProviderAccountData() {
    try {
      const { payload, status, code } = await this.context.ask(
        MESSENGER_METHODS.GET_SETTINGS,
      );

      if (!status) {
        throw ConnectError.create(code || ERRORS.AUTH);
      }

      const { settings = {} } = payload;
      const res = {
        activeAccount: settings.lastActiveAccount,
        activeNet: settings.net || Network.NET_ID.MAIN,
      };

      await this.context.executeMethod(
        PLUGIN_METHODS.CONTEXT_SET_PROVIDER_SETTINGS,
        res,
      );

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
  setInpageProviderSettings(payload) {
    this.emitter.emit(INPAGE_EVENTS.SETTINGS, {
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
      this.inpageProvider = new InpageProvider(this.emitter);
    }

    return this.inpageProvider;
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
      await this.getProviderAccountData();
    } catch (e) {
      if (e.code === ERRORS.AUTH_CANCELED_BY_USER) {
        throw ConnectError.create(ERRORS.AUTH_CANCELED_BY_USER);
      }

      await this.context.executeMethod(PLUGIN_METHODS.CONTEXT_AUTHORIZE);

      await this.getProviderAccountData();
    }
  }
}

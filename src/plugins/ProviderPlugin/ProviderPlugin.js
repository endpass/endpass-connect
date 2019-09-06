import ConnectError from '@endpass/class/ConnectError';
import Network from '@endpass/class/Network';
import Emmiter from '@/plugins/ProviderPlugin/Emmiter';
import InpageProvider from '@/plugins/ProviderPlugin/InpageProvider';
import { INPAGE_EVENTS, MESSENGER_METHODS, PLUGIN_METHODS } from '@/constants';
import ProviderFactory from '@/plugins/ProviderPlugin/ProviderFactory';
import createInpageProviderStream from '@/streams/inpageProvider/inpageProviderStream';
import PluginComponent from '../PluginBase';
import WidgetComponent from '../WidgetPlugin';
import AuthorizeComponent from '../AuthorizePlugin';
import PluginFactory from '@/class/PluginFactory';
import DialogPlugin from '@/plugins/DialogPlugin';
import MessengerGroupPlugin from '@/plugins/MessengerGroupPlugin';

const { ERRORS } = ConnectError;

export class ProviderPlugin extends PluginComponent {
  static get dependencyPlugins() {
    return [DialogPlugin, AuthorizeComponent, WidgetComponent];
  }

  static get lastPlugins() {
    return [MessengerGroupPlugin];
  }

  static get pluginName() {
    return 'provider';
  }

  constructor(options, context) {
    super(options, context);

    this.emitter = new Emmiter();
    this.emitter.on(INPAGE_EVENTS.LOGIN, async () => {
      let error = null;

      if (!this.context.isLogin) {
        try {
          this.serverAuth();
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

      // await this.context.auth();
      await this.context.executeMethod(PLUGIN_METHODS.CONTEXT_AUTHORIZE);

      await this.getProviderAccountData();
    }
  }
}

export default PluginFactory.create(ProviderPlugin);

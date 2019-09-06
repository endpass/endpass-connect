import ConnectError from '@endpass/class/ConnectError';
import { MESSENGER_METHODS } from '@/constants';
import authHandlers from '@/plugins/AuthorizePlugin/authHandlers';
import PluginBase from '@/plugins/PluginBase';
import PluginFactory from '@/class/PluginFactory';
import DialogPlugin from '@/plugins/DialogPlugin/DialogPlugin';
import MessengerGroupPlugin from '@/plugins/MessengerGroupPlugin/MessengerGroupPlugin';

const { ERRORS } = ConnectError;

class AuthorizePlugin extends PluginBase {
  static get pluginName() {
    return 'authorize';
  }

  static get handlers() {
    return authHandlers;
  }

  static get dependencyPlugins() {
    return [DialogPlugin];
  }

  static get lastPlugins() {
    return [MessengerGroupPlugin];
  }

  constructor(options, context) {
    super(options, context);
    this.isServerLogin = false;
    this.haveDemoData = !!options.demoData;
  }

  get isLogin() {
    if (this.haveDemoData) {
      return true;
    }

    return this.isServerLogin;
  }

  set isLogin(value) {
    this.isServerLogin = value;
  }

  /**
   * Open application on auth screen and waits result (success of failure)
   * @public
   * @throws {Error} If authentication failed
   * @returns {Promise<boolean>} AuthorizePlugin result, check `status` property to
   *  know about result
   */
  async authorizeMe(redirectUrl) {
    const toPath = redirectUrl || window.location.href;

    const res = await this.context.ask(MESSENGER_METHODS.AUTH, {
      redirectUrl: toPath,
    });

    if (!res.status) {
      throw ConnectError.create(res.code || ERRORS.AUTH);
    }

    this.isLogin = true;

    return {
      payload: res.payload,
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
    const res = await this.context.ask(MESSENGER_METHODS.LOGOUT);

    if (!res.status) {
      throw ConnectError.create(res.code || ERRORS.AUTH_LOGOUT);
    }

    this.isLogin = false;

    return res.status;
  }
}

export default PluginFactory.create(AuthorizePlugin);

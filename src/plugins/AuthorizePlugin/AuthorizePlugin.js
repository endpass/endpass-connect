import ConnectError from '@/class/ConnectError';
import { MESSENGER_METHODS, PLUGIN_NAMES } from '@/constants';
import authHandlers from '@/plugins/AuthorizePlugin/authHandlers';
import PluginBase from '@/plugins/PluginBase';
import { BridgePlugin } from '@/plugins/BridgePlugin';
import { BroadcastPlugin } from '@/plugins/BroadcastPlugin';
import AuthApi from '@/plugins/AuthorizePlugin/AuthPublicApi';

const { ERRORS } = ConnectError;

export default class AuthorizePlugin extends PluginBase {
  static get pluginName() {
    return PLUGIN_NAMES.AUTHORIZE;
  }

  static get handlers() {
    return authHandlers;
  }

  static get dependencyPlugins() {
    return [BridgePlugin, BroadcastPlugin];
  }

  static get publicApi() {
    return AuthApi;
  }

  constructor(options, context) {
    super(options, context);
    this.isServerLogin = false;
  }

  get isLogin() {
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

import ConnectError from '@endpass/class/ConnectError';
import { METHODS } from '@/constants';

const { ERRORS } = ConnectError;

export default class Auth {
  constructor({ context, haveDemoData }) {
    this.context = context;
    this.haveDemoData = haveDemoData;
    this.isServerLogin = false;
  }

  isLogin() {
    if (this.haveDemoData) {
      return true;
    }

    const { activeAccount } = this.context.getInpageProvider().settings;

    return !!(activeAccount && this.isServerLogin);
  }

  /**
   * Open application on auth screen and waits result (success of failure)
   * @public
   * @throws {Error} If authentification failed
   * @returns {Promise<boolean>} Auth result, check `status` property to
   *  know about result
   */
  async auth(redirectUrl) {
    const toPath = redirectUrl || window.location.href;
    const res = await this.context.askDialog(METHODS.AUTH, {
      redirectUrl: toPath,
    });

    if (!res.status) {
      throw ConnectError.create(res.code || ERRORS.AUTH);
    }

    this.isServerLogin = true;

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
    const res = await this.context.getDialog().ask(METHODS.LOGOUT);

    if (!res.status) {
      throw ConnectError.create(res.code || ERRORS.AUTH_LOGOUT);
    }

    this.isServerLogin = false;

    return res.status;
  }
}

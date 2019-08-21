import ConnectError from '@endpass/class/ConnectError';
import { METHODS } from '@/constants';

const { ERRORS } = ConnectError;

export default class Auth {
  constructor({ dialog }) {
    this.dialog = dialog;
    this.isServerLogin = false;
  }

  get isLogin() {
    return this.isServerLogin;
  }

  setLoggedIn(value) {
    this.isServerLogin = value;
  }

  /**
   * Open application on auth screen and waits result (success of failure)
   * @public
   * @throws {Error} If authentication failed
   * @returns {Promise<boolean>} Auth result, check `status` property to
   *  know about result
   */
  async auth(redirectUrl) {
    const toPath = redirectUrl || window.location.href;

    const res = await this.dialog.ask(METHODS.AUTH, {
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
    const res = await this.dialog.ask(METHODS.LOGOUT);

    if (!res.status) {
      throw ConnectError.create(res.code || ERRORS.AUTH_LOGOUT);
    }

    this.isServerLogin = false;

    return res.status;
  }
}

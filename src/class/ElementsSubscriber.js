import ConnectError from '@endpass/class/ConnectError';
import Emitter from '@/class/Emmiter';

const { ERRORS } = ConnectError;

export default class ElementsSubscriber {
  /**
   * @param {object} options
   * @param InstanceType<{import('@Context')} options.context Context link
   */
  constructor({ context }) {
    this.context = context;
    this.emitter = new Emitter();
  }

  async handleLogoutMessage(source, req) {
    try {
      await this.context.logout();

      this.emitter.emit('logout');

      req.answer({
        status: true,
        source,
      });
    } catch (err) {
      req.answer({
        status: false,
        error: err,
        code: (err && err.code) || ERRORS.AUTH_LOGOUT,
      });
    }
  }

  /* eslint-disable-next-line */
  async handleSettingsChange(payload, req) {
    try {
      this.context.setProviderSettings(payload);

      this.emitter.emit('set-provider-settings', payload);

      req.answer({
        status: true,
      });
    } catch (err) {
      req.answer({
        status: false,
        error: err,
        code: (err && err.code) || ERRORS.ACCOUNT_UPDATE,
      });
    }
  }

  handleSetAuthStatus(status) {
    this.context.getAuthRequester().isLogin = status;
  }

  handleGetSettings(payload, req) {
    const { settings } = this.context.inpageProvider;
    req.answer(settings);
  }
}

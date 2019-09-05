import PluginBase from './PluginBase';
import Auth from '@/class/Auth';

export default class AuthPlugin extends PluginBase {
  constructor(props, context) {
    super(props, context);

    this.authRequester = new Auth({
      dialog: this.context.getDialog(),
      options: this.options,
    });
  }

  get isLogin() {
    return this.authRequester.isLogin;
  }

  /**
   * Open application on auth screen and waits result (success of failure)
   * @public
   * @throws {Error} If authentification failed
   * @returns {Promise<boolean>} Auth result, check `status` property to
   *  know about result
   */
  auth(url) {
    return this.authRequester.auth(url);
  }

  handleEvent(payload, req) {
    return this.authRequester.handleEvent(payload, req);
  }

  static get pluginName() {
    return 'auth';
  }
}

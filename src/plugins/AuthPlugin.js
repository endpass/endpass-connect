import Auth from '@/class/Auth';
import Plugin from '@/plugins/Plugin';

export default class AuthPlugin extends Plugin {
  constructor(context, options) {
    super(context);
    this.options = options;
  }

  static pluginName() {
    return 'auth';
  }

  /**
   *
   * @return {Auth}
   */
  getAuthInstance() {
    if (!this.authRequester) {
      this.authRequester = new Auth({
        dialog: this.context.getDialog(),
        options: this.options,
      });
    }
    return this.authRequester;
  }
}

import Auth from '@/class/Auth';
import Plugin from '@/plugins/Plugin';

export default class AuthPlugin extends Plugin {
  constructor(props) {
    super(props);
    this.options = props.options;
  }

  static getName() {
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

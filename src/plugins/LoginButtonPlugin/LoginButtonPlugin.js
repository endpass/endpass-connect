import ConnectError from '@endpass/class/ConnectError';
import { OauthPlugin } from '@/plugins/OauthPlugin';
// import { inlineStyles } from '@/util/dom';
import PluginBase from '../PluginBase';
import LoginButtonPublicApi from './LoginButtonPublicApi';
import { PLUGIN_METHODS } from '@/constants';

const { ERRORS } = ConnectError;

export default class LoginButtonPlugin extends PluginBase {
  static get pluginName() {
    return 'loginButton';
  }

  static get dependencyPlugins() {
    return [OauthPlugin];
  }

  static get publicApi() {
    return LoginButtonPublicApi;
  }

  constructor(options, context) {
    super(options, context);
    if (options.oauthClientId) {
      throw ConnectError.create(ERRORS.LOGIN_BUTTON_REQUIRED_API_KEY);
    }
    this.button = null;
    this.callback = null;

    this.onClickHandler = this.onClickHandler.bind(this);
  }

  mount(element, callback) {
    if (!element) {
      throw ConnectError.create(ERRORS.LOGIN_BUTTON_REQUIRED_ELEMENT);
    }
    this.callback = callback;

    const styles = {};
    this.element.innerHTML = `<button
      style="${styles}"
      data-test="login-button"
    >OAuth</button>`;

    this.button = this.element.firstChild;
    this.button.addEventListener('click', this.onClickHandler);
  }

  unmount() {
    if (this.button instanceof HTMLElement) {
      this.button.removeEventListener('click', this.onClickHandler);
      this.button.parentNode.removeChild(this.button);
    }
  }

  async onClickHandler() {
    await this.context.executeMethod(PLUGIN_METHODS.CONTEXT_LOGIN_WITH_OAUTH);
    if (this.callback instanceof Function) {
      this.callback();
    }
  }
}

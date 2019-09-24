import { PLUGIN_METHODS, PLUGIN_NAMES } from '@/constants';
import { OauthPlugin } from '@/plugins/OauthPlugin';
import PluginBase from '../PluginBase';
import LoginButton from './LoginButton';
import LoginButtonPublicApi from './LoginButtonPublicApi';

export default class LoginButtonPlugin extends PluginBase {
  static get pluginName() {
    return PLUGIN_NAMES.LOGIN_BUTTON;
  }

  static get dependencyPlugins() {
    return [OauthPlugin];
  }

  static get publicApi() {
    return LoginButtonPublicApi;
  }

  createLoginButton({ element, label, isLight, onLogin } = {}) {
    const onClick = () => this.onAuthorize(onLogin);
    return new LoginButton({
      element,
      label,
      isLight,
      onClick,
    });
  }

  async onAuthorize(userCallback) {
    let error;
    let result;

    try {
      result = await this.context.executeMethod(
        PLUGIN_METHODS.CONTEXT_OAUTH_AUTHORIZE,
      );
    } catch (e) {
      error = e;
    }

    if (userCallback) {
      userCallback(error, result);
    }

    return {
      error,
      result,
    };
  }
}

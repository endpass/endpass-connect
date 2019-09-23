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
    const onClick = this.wrapCallback(onLogin);
    return new LoginButton({
      element,
      label,
      isLight,
      onClick,
    });
  }

  wrapCallback(userCallback) {
    const self = this;

    return async () => {
      let error;
      let result;

      try {
        result = await self.context.executeMethod(
          PLUGIN_METHODS.CONTEXT_OAUTH_AUTHORIZE,
        );
      } catch (e) {
        error = e;
      }

      if (userCallback instanceof Function) {
        userCallback(error, result);
      }

      return error;
    };
  }
}

import { OauthPlugin } from '@/plugins/OauthPlugin';
import PluginBase from '../PluginBase';
import LoginButtonFactory from './LoginButton/LoginButtonFactory';
import LoginButtonPublicApi from './LoginButtonPublicApi';

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

  createLoginButton(options = {}) {
    return LoginButtonFactory.create(options, this.context);
  }
}

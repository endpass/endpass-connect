import ConnectError from '@endpass/class/ConnectError';
import OauthPkceStrategy from '@/plugins/OauthPlugin/Oauth/OauthPkceStrategy';
import Oauth from '@/plugins/OauthPlugin/Oauth';
import PluginBase from '../PluginBase';
import { DialogPlugin } from '@/plugins/DialogPlugin';
import { MessengerGroupPlugin } from '@/plugins/MessengerGroupPlugin';
import OauthApi from '@/plugins/OauthPlugin/OauthPublicApi';

const { ERRORS } = ConnectError;

export default class OauthPlugin extends PluginBase {
  static get pluginName() {
    return 'oauth';
  }

  static get dependencyPlugins() {
    return [DialogPlugin, MessengerGroupPlugin];
  }

  static get publicApi() {
    return OauthApi;
  }

  constructor(options, context) {
    super(options, context);
    if (!options.oauthClientId) {
      throw ConnectError.create(ERRORS.OAUTH_REQUIRE_ID);
    }
    this.oauthClientId = options.oauthClientId;
  }

  get oauthProvider() {
    if (!this.oauthRequestProvider) {
      throw ConnectError.create(ERRORS.OAUTH_REQUIRE_AUTHORIZE);
    }
    return this.oauthRequestProvider;
  }

  /**
   * Fetch user data via oaurh
   * @param {object} [params] Parameters object
   * @param {number} [params.popupWidth] Oauth popup width
   * @param {number} [params.popupHeight] Oauth popup height
   * @param {string[]} params.scopes - Array of authorization scopes
   */
  async loginWithOauth(params) {
    const strategy = new OauthPkceStrategy({
      context: this.context,
    });

    this.oauthRequestProvider = new Oauth({
      ...params,
      clientId: this.oauthClientId,
      strategy,
    });
    await this.oauthRequestProvider.init();
  }

  logout() {
    this.oauthRequestProvider.logout();
  }

  setPopupParams(params) {
    this.oauthProvider.setPopupParams(params);
  }

  request(options) {
    return this.oauthProvider.request(options);
  }
}

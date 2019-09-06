import ConnectError from '@endpass/class/ConnectError';
import OauthPkceStrategy from '@/class/Oauth/OauthPkceStrategy';
import Oauth from '@/class/Oauth';
import PluginFactory from '@/class/PluginFactory';
import PluginBase from './PluginBase';

const { ERRORS } = ConnectError;

class OauthPlugin extends PluginBase {
  constructor(options, context) {
    super(options, context);
    if (!options.oauthClientId) {
      throw ConnectError.create(ERRORS.OAUTH_REQUIRE_ID);
    }
    this.oauthClientId = options.oauthClientId;
  }

  static get pluginName() {
    return 'oauth';
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
    if (!this.oauthRequestProvider) {
      throw ConnectError.create(ERRORS.OAUTH_NOT_LOGGED_IN);
    }
    this.oauthRequestProvider.logout();
  }

  setPopupParams(params) {
    this.oauthProvider.setPopupParams(params);
  }

  request(options) {
    return this.oauthProvider.request(options);
  }
}

export default PluginFactory.create(OauthPlugin);

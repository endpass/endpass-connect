import ConnectError from '@endpass/class/ConnectError';
import PopupWindow from '@/plugins/OauthPlugin/Popup/PopupWindow';
import IframeWindow from '@/plugins/OauthPlugin/Popup/IframeWindow';
import OauthPkceStrategy from '@/plugins/OauthPlugin/Oauth/OauthPkceStrategy';
import Oauth from '@/plugins/OauthPlugin/Oauth';
import PluginBase from '../PluginBase';
import { DialogPlugin } from '@/plugins/DialogPlugin';
import { MessengerGroupPlugin } from '@/plugins/MessengerGroupPlugin';
import OauthApi from '@/plugins/OauthPlugin/OauthPublicApi';
import { PLUGIN_METHODS, PLUGIN_NAMES } from '@/constants';

const { ERRORS } = ConnectError;

const documentsCheckReg = /\/documents$/gi;

export default class OauthPlugin extends PluginBase {
  static get pluginName() {
    return PLUGIN_NAMES.OAUTH;
  }

  static get dependencyPlugins() {
    return [DialogPlugin, MessengerGroupPlugin];
  }

  static get publicApi() {
    return OauthApi;
  }

  constructor(options, context) {
    super(options, context);

    this.oauthClientId = options.oauthClientId;
    this.oauthServer = options.oauthServer;
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
   * @param {string} [params.oauthServer] Oauth server url
   * @param {string[]} params.scopes - Array of authorization scopes
   */
  async loginWithOauth(params) {
    const strategy = new OauthPkceStrategy({
      context: this.context,
      popup: PopupWindow,
    });

    this.oauthRequestProvider = new Oauth({
      ...params,
      oauthServer: this.oauthServer || params.oauthServer,
      clientId: this.oauthClientId,
      strategy,
    });
    await this.oauthRequestProvider.init();
  }

  async loginWithOauthIframe(params) {
    const strategy = new OauthPkceStrategy({
      context: this.context,
      popup: IframeWindow,
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

  async request(options) {
    let result = await this.oauthProvider.request(options);
    const { data } = result || {};

    if (data && !data.length && options.url.search(documentsCheckReg) !== -1) {
      try {
        await this.context.executeMethod(
          PLUGIN_METHODS.CONTEXT_CREATE_DOCUMENT,
        );
        result = await this.oauthProvider.request(options);
      } catch (e) {}
    }

    return result;
  }
}

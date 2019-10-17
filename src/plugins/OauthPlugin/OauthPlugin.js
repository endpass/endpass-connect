import ConnectError from '@endpass/class/ConnectError';
import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import OauthPkceStrategy from '@/plugins/OauthPlugin/Oauth/OauthPkceStrategy';
import Oauth from '@/plugins/OauthPlugin/Oauth';
import PluginBase from '../PluginBase';
import { DialogPlugin } from '@/plugins/DialogPlugin';
import { MessengerGroupPlugin } from '@/plugins/MessengerGroupPlugin';
import OauthApi from '@/plugins/OauthPlugin/OauthPublicApi';
import { DIRECTION, PLUGIN_METHODS, PLUGIN_NAMES } from '@/constants';
import oauthHandlers from './oauthHandlers';
import FrameStrategy from '@/plugins/OauthPlugin/FrameStrategy';

const { ERRORS } = ConnectError;

const documentsCheckReg = /\/documents$/gi;

export default class OauthPlugin extends PluginBase {
  static get pluginName() {
    return PLUGIN_NAMES.OAUTH;
  }

  static get handlers() {
    return oauthHandlers;
  }

  static get dependencyPlugins() {
    return [DialogPlugin, MessengerGroupPlugin];
  }

  static get publicApi() {
    return OauthApi;
  }

  get messenger() {
    if (!this.oauthMessenger) {
      this.oauthMessenger = new CrossWindowMessenger({
        // showLogs: !ENV.isProduction,
        name: `connect-oauth-iframe[]`,
        to: DIRECTION.AUTH,
        from: DIRECTION.CONNECT,
      });
    }
    return this.oauthMessenger;
  }

  constructor(options, context) {
    super(options, context);

    this.oauthClientId = options.oauthClientId;
    this.oauthServer = options.oauthServer;

    this.frameStrategy = new FrameStrategy();

    this.frameStrategy.on(FrameStrategy.EVENT_UPDATE_TARGET, target => {
      this.messenger.setTarget(target);
    });

    this.oauthStrategy = new OauthPkceStrategy({
      context,
    });
  }

  handleReadyFrame(payload, req) {
    this.frameStrategy.handleReady(payload, req);
  }

  resizeFrame(payload) {
    this.frameStrategy.handleResize(payload);
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
    this.oauthRequestProvider = new Oauth({
      ...params,
      // TODO: is it `params.oauthServer` must be first? or after `this.oauthServer`?
      oauthServer: params.oauthServer || this.oauthServer,
      clientId: this.oauthClientId,
      oauthStrategy: this.oauthStrategy,
      frameStrategy: this.frameStrategy,
    });
    await this.oauthRequestProvider.init();
  }

  logout() {
    this.oauthRequestProvider.logout();
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

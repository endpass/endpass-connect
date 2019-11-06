// @ts-check

import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import OauthPkceStrategy from '@/plugins/OauthPlugin/Oauth/OauthPkceStrategy';
import Oauth from '@/plugins/OauthPlugin/Oauth';
import PluginBase from '../PluginBase';
import { DialogPlugin } from '@/plugins/DialogPlugin';
import { MessengerGroupPlugin } from '@/plugins/MessengerGroupPlugin';
import OauthApi from '@/plugins/OauthPlugin/OauthPublicApi';
import { DIRECTION, PLUGIN_METHODS, PLUGIN_NAMES } from '@/constants';
import oauthHandlers from '@/plugins/OauthPlugin/oauthHandlers';
import FrameStrategy from '@/plugins/OauthPlugin/FrameStrategy';

const documentsCheckReg = /\/documents$/gi;

export default class OauthPlugin extends PluginBase {
  /**
   * @returns {string}
   */
  static get pluginName() {
    return PLUGIN_NAMES.OAUTH;
  }

  /**
   * @returns {OauthHandlers}
   */
  static get handlers() {
    return oauthHandlers;
  }

  /**
   * @returns {[typeof DialogPlugin, typeof MessengerGroupPlugin]}
   */
  static get dependencyPlugins() {
    return [DialogPlugin, MessengerGroupPlugin];
  }

  /**
   * @returns {typeof OauthApi}
   */
  static get publicApi() {
    return OauthApi;
  }

  /**
   * @returns {CrossWindowMessenger}
   */
  get messenger() {
    if (!this.oauthMessenger) {
      this.oauthMessenger = new CrossWindowMessenger({
        // showLogs: !ENV.isProduction,
        name: 'connect-oauth-iframe[]',
        to: DIRECTION.AUTH,
        from: DIRECTION.CONNECT,
      });
    }

    return this.oauthMessenger;
  }

  /**
   * @param {ContextOptions} options 
   * @param {Context} context 
   */
  constructor(options, context) {
    super(options, context);

    this.oauthClientId = options.oauthClientId;
    this.oauthServer = options.oauthServer;

    this.frameStrategy = new FrameStrategy({
      oauthPopup: options.oauthPopup,
    });

    this.frameStrategy.on(FrameStrategy.EVENT_UPDATE_TARGET, /** @param {string} target */ target => {
      this.messenger.setTarget(target);
    });

    const oauthStrategy = new OauthPkceStrategy({
      context,
    });

    this.oauthRequestProvider = new Oauth({
      clientId: this.oauthClientId,
      scopes: options.scopes,
      oauthServer: this.oauthServer,
      oauthStrategy,
      frameStrategy: this.frameStrategy,
    });
  }

  /**
   * @param {string} [source]
   * @returns {boolean}
   */
  isSourceEqualTarget(source) {
    // @ts-ignore
    // Here we have excellent example of duck-overtyped logic.
    // Seems to we compare string with WIndow object (or null),
    // and if so, this predicate will return `true` only if source
    // will be `null`. For now will better ignore it.
    return source === this.frameStrategy.target;
  }

  /**
   * @returns {void}
   */
  handleReadyFrame() {
    this.frameStrategy.handleReady();
  }

  /**
   * @param {OauthResizeFrameEventPayload} payload 
   * @returns {void}
   */
  resizeFrame(payload) {
    this.frameStrategy.handleResize(payload);
  }

  /**
   * @returns {void}
   */
  handleCloseFrame() {
    this.frameStrategy.close();
  }

  /**
   * Fetch user data via oaurh
   * @deprecated
   * @param {object} params Parameters object
   * @param {string[]} [params.scopes] - Array of authorization scopes
   * @returns {Promise<void>}
   */
  async loginWithOauth(params = {}) {
    await this.oauthRequestProvider.loginWithOauth(params);
  }

  /**
   * @returns {void}
   */
  logout() {
    this.oauthRequestProvider.logout();
  }

  /**
   * @param {OauthRequestOptions} options
   * @returns {Promise<any>}
   */
  async request(options) {
    let result = await this.oauthRequestProvider.request(options);
    const { data } = result || {};

    if (data && !data.length && options.url && options.url.search(documentsCheckReg) !== -1) {
      try {
        await this.context.executeMethod(
          PLUGIN_METHODS.CONTEXT_CREATE_DOCUMENT,
        );
        result = await this.oauthRequestProvider.request(options);
      } catch (e) {}
    }

    return result;
  }
};
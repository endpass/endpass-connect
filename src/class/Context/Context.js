import ConnectError from '@endpass/class/ConnectError';
import { DEFAULT_AUTH_URL, METHODS } from '@/constants';
import PluginManager from '@/class/PluginManager';

import { getAuthUrl, getFrameRouteUrl } from '@/util/url';
import MessengerGroup from '@/class/MessengerGroup';
import Dialog from '@/class/Dialog';
import Auth from '@/class/Auth';
import OauthPlugin from '@/plugins/OauthPlugin';
import WidgetPlugin from '@/plugins/WidgetPlugin';
import EventSubscriber from '@/class/EventSubscriber';
import contextHandlers from './contextHandlers';

const { ERRORS } = ConnectError;

const DEFAULT_PLUGINS = [OauthPlugin, WidgetPlugin];

export default class Context {
  /**
   * @param {string} options.oauthClientId OAuth client id
   * @param {string} [options.authUrl] Url of hosted Endpass Connect Application
   * @param {string} [options.namespace] namespace for see difference,
   *  between two instances
   * @param {boolean} [options.isIdentityMode] isIdentityMode for define auth
   *  like identity
   * @param {object} [options.demoData] demoData passed object to auth
   * @param {object} [options.showCreateAccount] show create account form
   *  in auth dialog
   * @param {object} [options.widget] Widget configuration object.
   *  If provided widget will be mounted automatically
   * @param {object} [options.widget.position] Widget positions. By default
   *  equals to `bottom right`
   */
  constructor(options = {}) {
    const passedPlugins = options.plugins || [];
    this.options = options;
    this.authUrl = getAuthUrl(options.authUrl || DEFAULT_AUTH_URL);

    this.plugins = PluginManager.createPlugins(
      [...DEFAULT_PLUGINS, ...passedPlugins],
      {
        ...options,
        context: this,
      },
    );

    EventSubscriber.subscribe(this);
  }

  get subscribeData() {
    const { plugins } = this;
    const basicData = [...this.getDialog().subscribeData];
    const res = Object.keys(plugins).reduce((eventsList, pluginKey) => {
      const plugin = plugins[pluginKey];
      return eventsList.concat(plugin.subscribeData);
    }, basicData);
    return res;

    // [[messenger, events], [messenger, events]]
  }

  get isLogin() {
    return this.getAuthRequester().isLogin;
  }

  /**
   * @return {object}
   */
  get initialPayload() {
    const { demoData, isIdentityMode, showCreateAccount } = this.options;
    return {
      demoData,
      isIdentityMode: isIdentityMode || false,
      showCreateAccount,
    };
  }

  /**
   * Open application on auth screen and waits result (success of failure)
   * @public
   * @throws {Error} If authentification failed
   * @returns {Promise<boolean>} Auth result, check `status` property to
   *  know about result
   */
  auth(redirectUrl) {
    return this.getAuthRequester().auth(redirectUrl);
  }

  getAuthUrl() {
    return this.authUrl;
  }

  /**
   * Send request to logout through injected bridge bypass application dialog
   * @public
   * @throws {Error} If logout failed
   * @returns {Promise<Boolean>}
   */
  async logout() {
    const res = await this.getAuthRequester().logout();
    this.messengerGroup.send(METHODS.DIALOG_CLOSE);
    return res;
  }

  async serverAuth() {
    await this.plugins.provider.serverAuth();
  }

  /**
   * Define Current request
   * @param {Web3.Provider} reqProvider Web3 provider instance
   */
  setRequestProvider(reqProvider) {
    this.plugins.provider.setRequestProvider(reqProvider);
  }

  /**
   * Sets settings to current `web3` provider injected to page with `injectWeb3`
   * method
   * @param {object} payload
   * @param {string} payload.activeAccount Currenct account checksummed address
   * @param {string} payload.activeNet Active network ID
   */
  setProviderSettings(payload) {
    this.plugins.provider.setProviderSettings(payload);

    const settings = this.getInpageProviderSettings();
    this.messengerGroup.send(METHODS.CHANGE_SETTINGS_RESPONSE, settings);
  }

  getRequestProvider() {
    return this.plugins.provider.getRequestProvider();
  }

  getInpageProviderSettings() {
    return this.plugins.provider.getInpageProviderSettings();
  }

  getEmitter() {
    return this.plugins.provider.getEmitter();
  }

  getDialog() {
    if (!this.dialog) {
      this.dialog = new Dialog({
        element: this.options.element,
        namespace: this.options.namespace,
        url: getFrameRouteUrl(this.getAuthUrl(), 'bridge'),
      });
      this.messengerGroup.addMessenger(this.dialog.getDialogMessenger());
    }

    return this.dialog;
  }

  async handleEvent(payload, req) {
    try {
      // global methods
      if (contextHandlers[req.method]) {
        await contextHandlers[req.method].apply(this, [payload, req]);
      }

      await this.getDialog().handleEvent(payload, req);

      await Object.keys(this.plugins).reduce(async (accumP, pluginKey) => {
        await this.plugins[pluginKey].handleEvent(payload, req);
        return accumP;
      }, Promise.resolve);
    } catch (err) {
      throw ConnectError.create((err && err.code) || ERRORS.NOT_DEFINED);
    }
  }

  /**
   *
   * @return {MessengerGroup}
   */
  get messengerGroup() {
    if (!this.messengerGroupPrivate) {
      this.messengerGroupPrivate = new MessengerGroup();
    }
    return this.messengerGroupPrivate;
  }

  getAuthRequester() {
    if (!this.authRequester) {
      this.authRequester = new Auth({
        dialog: this.getDialog(),
        options: this.options,
      });
    }
    return this.authRequester;
  }
}

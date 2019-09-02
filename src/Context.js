import { DEFAULT_AUTH_URL, METHODS } from '@/constants';
import PluginManager from '@/PluginManager';

import { getAuthUrl, getFrameRouteUrl } from '@/util/url';
import MessengerGroup from '@/class/MessengerGroup';
import Dialog from '@/class/Dialog';
import ElementsSubscriber from '@/class/ElementsSubscriber';
import Auth from '@/class/Auth';
import OauthPlugin from '@/plugins/OauthPlugin';
import WidgetPlugin from '@/plugins/WidgetPlugin';

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
    const optionPlugins = options.plugins || [];
    this.options = options;
    this.authUrl = getAuthUrl(options.authUrl || DEFAULT_AUTH_URL);

    this.plugins = PluginManager.createPlugins(
      [...DEFAULT_PLUGINS, ...optionPlugins],
      {
        options,
        context: this,
      },
    );
    PluginManager.initPlugins(this.plugins);

    // TODO: create state
    // this.state = {
    //   isPermission: false,
    //   isLogin: false,
    // };
  }

  get isLogin() {
    return this.getAuthRequester().isLogin;
  }

  /**
   * @return {object}
   */
  getInitialPayload() {
    const { demoData, isIdentityMode, showCreateAccount } = this.options;
    return {
      demoData,
      isIdentityMode: isIdentityMode || false,
      showCreateAccount,
    };
  }

  getElementsSubscriber() {
    if (!this.elementsSubscriber) {
      this.elementsSubscriber = new ElementsSubscriber({
        context: this,
      });
    }
    return this.elementsSubscriber;
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
    this.getMessengerGroupInstance().send(METHODS.LOGOUT_RESPONSE);
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
    this.getMessengerGroupInstance().send(
      METHODS.CHANGE_SETTINGS_RESPONSE,
      settings,
    );
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
        initialPayload: this.getInitialPayload(),
        elementsSubscriber: this.getElementsSubscriber(),
        url: getFrameRouteUrl(this.getAuthUrl(), 'bridge'),
      });
      this.getMessengerGroupInstance().addMessenger(
        this.dialog.getDialogMessenger(),
      );
    }

    return this.dialog;
  }

  getWidget() {
    return this.plugins.widget.getWidgetInstance();
  }

  /**
   *
   * @return {MessengerGroup}
   */
  getMessengerGroupInstance() {
    if (!this.messengerGroup) {
      this.messengerGroup = new MessengerGroup();
    }
    return this.messengerGroup;
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

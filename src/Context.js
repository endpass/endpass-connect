import Network from '@endpass/class/Network';
import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import CrossWindowBroadcaster from '@endpass/class/CrossWindowBroadcaster';
import { Emmiter, InpageProvider, Bridge, ProviderFactory } from '@/class';
import {
  INPAGE_EVENTS,
  METHODS,
  DEFAULT_AUTH_URL,
  DIRECTION,
} from '@/constants';

import pkg from '../package.json';

const authUrlRegexp = new RegExp('://auth(\\.|-)', 'ig');

export default class Context {
  /**
   * @param {String} options.authUrl Url of hosted Endpass Connect Application
   * @param {String} [options.namespace] namespace for see difference, between two instances
   * @param {Boolean} options.isIdentityMode isIdentityMode for define auth like identity
   * @param {Object} options.demoData demoData passed object to auth
   * @param {Object} options.widget Widget configuration object. If provided widget
   *  will be mounted automatically
   * @param {Object} options.widget.position Widget positions. By default
   *  equals to `bottom right`
   */
  constructor(options = {}) {
    const authUrl = options.authUrl || DEFAULT_AUTH_URL;

    /**
     * Independant class properties
     */
    this.inpageProvider = null;
    this.requestProvider = null;
    this.isServerLogin = false;
    this.isWidgetMounted = false;
    this.authUrl = !authUrlRegexp.test(authUrl)
      ? authUrl
      : authUrl.replace('://auth', `://auth${pkg.authVersion}`);
    this.namespace = options.namespace || '';
    this.haveDemoData = !!options.demoData;

    /**
     * Inner abstractions initialization
     */
    this.emitter = new Emmiter();
    this.inpageProvider = new InpageProvider(this.emitter);
    this.requestProvider = ProviderFactory.createRequestProvider();
    this.dialogMessenger = new CrossWindowMessenger({
      showLogs: !ENV.isProduction,
      name: `connect-bridge[${this.namespace}]`,
      to: DIRECTION.AUTH,
      from: DIRECTION.CONNECT,
    });
    this.widgetMessenger = new CrossWindowMessenger({
      showLogs: !ENV.isProduction,
      name: `connect-bridge[${this.namespace}]`,
      to: DIRECTION.AUTH,
      from: DIRECTION.CONNECT,
    });
    this.bridgeBroadcaster = new CrossWindowBroadcaster({
      method: [METHODS.BROADCAST],
    });
    this.bridge = new Bridge({
      context: this,
      url: this.getConnectUrl('bridge'),
      initialPayload: {
        demoData: options.demoData,
        isIdentityMode: options.isIdentityMode || false,
      },
    });

    this.setupLoginEvents();
    this.initBridgeBroadcaster();

    if (options.widget !== false) {
      this.mountWidgetOnAuth(options.widget);
    }
  }

  initBridgeBroadcaster() {
    this.bridgeBroadcaster.pushMessengers([
      this.dialogMessenger,
      this.widgetMessenger,
    ]);
  }

  setupLoginEvents() {
    this.emitter.on(INPAGE_EVENTS.LOGIN, async () => {
      let error = null;

      if (!this.isLogin()) {
        try {
          await this.serverAuth();
        } catch (e) {
          error = new Error('Request data error');
        }
      }

      this.emitter.emit(INPAGE_EVENTS.LOGGED_IN, { error });
    });
  }

  async askDialog(params) {
    const { method, payload } = params;
    const bridge = this.getBridge();
    const res = await bridge.ask(method, payload);

    return res;
  }

  isLogin() {
    if (this.haveDemoData) {
      return true;
    }

    const { activeAccount } = this.getInpageProvider().settings;

    return !!(activeAccount && this.isServerLogin);
  }

  /**
   * Open application on auth screen and waits result (success of failure)
   * @public
   * @throws {Error} If authentification failed
   * @returns {Promise<boolean>} Auth result, check `status` property to
   *  know about result
   */
  async auth(redirectUrl) {
    const toPath = redirectUrl || window.location.href;
    const res = await this.askDialog({
      method: METHODS.AUTH,
      payload: {
        redirectUrl: toPath,
      },
    });

    if (!res.status) throw new Error(res.error || 'Authentificaton error!');

    this.isServerLogin = true;

    return {
      payload: res.payload,
      status: res.status,
    };
  }

  /**
   * Send request to logout through injected bridge bypass application dialog
   * @public
   * @throws {Error} If logout failed
   * @returns {Promise<Boolean>}
   */
  async logout() {
    const res = await this.getBridge().ask(METHODS.LOGOUT);

    if (!res.status) throw new Error(res.error || 'Logout error!');

    this.isServerLogin = false;
    this.bridgeBroadcaster.send(METHODS.LOGOUT_RESPONSE, {});

    return res.status;
  }

  /**
   * Requests user settings from injected bridge and returns formatted data
   * Settings includes last active account and network id
   * @public
   * @throws {Error} If settings can not be resolved
   * @returns {Promise<Object>} Account data
   */
  async getAccountData() {
    try {
      const { payload, status, error } = await this.getBridge().ask(
        METHODS.GET_SETTINGS,
      );

      if (!status) {
        throw new Error(error || 'User settings are not received!');
      }

      this.isServerLogin = true;

      const { settings = {} } = payload;

      return {
        activeAccount: settings.lastActiveAccount,
        activeNet: settings.net || Network.NET_ID.MAIN,
      };
    } catch (err) {
      throw new Error('User not authorized!');
    }
  }

  async serverAuth() {
    let settings;

    try {
      settings = await this.getAccountData();
    } catch (e) {
      await this.auth();
      settings = await this.getAccountData();
    }

    this.setProviderSettings(settings);
    this.isServerLogin = true;
  }

  /**
   * Define Current request
   * @param {Web3.Provider} reqProvider Web3 provider instance
   */
  setRequestProvider(reqProvider) {
    this.requestProvider = reqProvider;
  }

  /**
   * Sets settings to current `web3` provider injected to page with `injectWeb3`
   * method
   * @param {String} options.activeAccount Currenct account checksummed address
   * @param {String} options.activeNet Active network ID
   */
  setProviderSettings(payload) {
    this.getEmitter().emit(INPAGE_EVENTS.SETTINGS, {
      activeAccount: payload.activeAccount,
      activeNet: payload.activeNet || Network.NET_ID.MAIN,
    });
    this.bridgeBroadcaster.send(
      METHODS.CHANGE_SETTINGS_RESPONSE,
      this.getProviderSettings(),
    );
  }

  getProviderSettings() {
    return this.inpageProvider.settings;
  }

  mountWidget(parameters) {
    if (this.isWidgetMounted) return;

    this.isWidgetMounted = true;
    this.bridge.mountWidget(parameters);
  }

  unmountWidget() {
    if (!this.isWidgetMounted) return;

    this.isWidgetMounted = false;
    this.bridge.unmountWidget();
  }

  /* eslint-disable-next-line */
  mountWidgetOnAuth(parameters) {
    return new Promise(res => {
      const handler = () =>
        /* eslint-disable-next-line */
        setTimeout(async () => {
          try {
            await this.getAccountData();
            this.mountWidget(parameters);

            return res();
          } catch (err) {
            handler();
          }
        }, 1500);

      handler();
    });
  }

  getInpageProvider() {
    return this.inpageProvider;
  }

  getRequestProvider() {
    return this.requestProvider;
  }

  /**
   * Returns injected provider settings
   * @private
   * @returns {Object} Current provider settings
   */
  getInpageProviderSettings() {
    return { ...this.getInpageProvider().settings };
  }

  /**
   * Returns connect application url with passed method
   * @private
   * @param {String} method Expected method (route)
   * @returns {String} Completed url to open
   */
  getConnectUrl(method) {
    const { authUrl } = this;

    return !method ? authUrl : `${authUrl}/${method}`;
  }

  getEmitter() {
    return this.emitter;
  }

  getBridge() {
    return this.bridge;
  }

  getDialogMessenger() {
    return this.dialogMessenger;
  }

  getWidgetMessenger() {
    return this.widgetMessenger;
  }

  getBroadcaster() {
    return this.bridgeBroadcaster;
  }

  getNamespace() {
    return this.namespace;
  }
}

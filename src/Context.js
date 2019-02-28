import { Emmiter, InpageProvider, Dialog, Bridge } from '@/class';
import { INPAGE_EVENTS, METHODS, NET_ID, DEFAULT_AUTH_URL } from '@/constants';

export default class Context {
  /**
   * @param {String} options.authUrl Url of hosted Endpass Connect Application
   * @param {Boolean} options.isIdentityMode isIdentityMode for define auth like identity
   * @param {Object} options.demoData demoData passed object to auth
   */
  constructor(options = {}) {
    this.authUrl = options.authUrl || DEFAULT_AUTH_URL;
    this.isIdentityMode = options.isIdentityMode || false;
    this.demoData = options.demoData;

    this.emitter = new Emmiter();
    const provider = new InpageProvider(this.emitter);
    this.setInpageProvider(provider);

    this.requestProvider = null;

    this.dialog = null;
    this.bridge = null;
    this.isServerLogin = false;
    this.initBridge();
    this.setupLoginEvents();
  }

  static getDemoDataQueryString(demoData) {
    if (!demoData) {
      return '';
    }

    let res = '';
    try {
      const passData = encodeURIComponent(JSON.stringify(demoData));
      res = `demoData=${passData}`;
    } catch (e) {}

    return res;
  }

  /**
   * Define Bridge instance
   * @param {props} props properties for instance
   */
  initBridge() {
    const url = this.getConnectUrl('bridge');
    this.bridge = new Bridge({ url });
    this.getBridge().mount();
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

  /**
   * Opens application with given route in child window
   * Also awaits ready state message from dialog
   * After receiving message – returns link to opened window
   * @param {String} route Target connect application route
   * @returns {Promise<Window>} Opened child window
   */
  async openApp(route = '', queryParams = {}) {
    const queryStr = Object.keys(queryParams)
      .map(key => {
        return `${key}=${queryParams[key]}`;
      })
      .join('&');

    const demoQuery = Context.getDemoDataQueryString(this.demoData);

    const queries = [queryStr, demoQuery].filter(item => !!item).join('&');

    const path = queries ? `${route}?${queries}` : route;

    const url = this.getConnectUrl(path);

    this.dialog = new Dialog({ url });

    await this.getDialog().open();
  }

  isLogin() {
    if (this.demoData) {
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
    const query = this.isIdentityMode ? { mode: true } : {};
    await this.openApp('auth', query);

    const dialog = this.getDialog();

    const res = await dialog.ask({
      method: METHODS.AUTH,
      redirectUrl: redirectUrl || null,
    });

    dialog.close();

    if (!res.status) throw new Error(res.message || 'Authentificaton error!');
    this.isServerLogin = true;

    const result = {
      ...res.payload,
      status: res.status,
    };

    return result;
  }

  /**
   * Send request to logout through injected bridge bypass application dialog
   * @public
   * @throws {Error} If logout failed
   * @returns {Promise<Boolean>}
   */
  async logout() {
    const res = await this.getBridge().ask({
      method: METHODS.LOGOUT,
    });

    if (!res.status) throw new Error(res.message || 'Logout error!');
    this.isServerLogin = false;

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
      const settings = await this.getBridge().ask({
        method: METHODS.GET_SETTINGS,
      });

      if (!settings.status) {
        throw new Error(settings.message || 'User settings are not received!');
      }

      this.isServerLogin = true;

      return {
        activeAccount: settings.lastActiveAccount,
        activeNet: settings.net || NET_ID.MAIN,
      };
    } catch (err) {
      throw new Error('User not autorized!');
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

  setInpageProvider(provider) {
    this.inpageProvider = provider;
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
    this.getEmitter().emit(INPAGE_EVENTS.SETTINGS, payload);
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

  getDialog() {
    return this.dialog;
  }

  getBridge() {
    return this.bridge;
  }
}

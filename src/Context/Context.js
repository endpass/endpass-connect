import { Emmiter, InpageProvider, Dialog, Bridge } from '@/class';

export default class Context {
  /**
   * @param {String} options.authUrl Url of hosted Endpass Connect Application
   */
  constructor(options = {}) {
    this.authUrl = options.authUrl || 'https://auth.endpass.com';

    this.emitter = new Emmiter();
    const provider = new InpageProvider(this.emitter);
    this.setProvider(provider);

    this.requestProvider = null;

    this.dialog = null;
    this.bridge = null;
    this.initBridge();
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

  /**
   * Opens application with given route in child window
   * Also awaits ready state message from dialog
   * After receiving message – returns link to opened window
   * @param {String} route Target connect application route
   * @returns {Promise<Window>} Opened child window
   */
  async openApp(route = '') {
    const url = this.getConnectUrl(route);

    this.dialog = new Dialog({ url });

    await this.getDialog().open();
  }

  setProvider(provider) {
    this.provider = provider;
  }

  /**
   * Define Current request
   * @param {Web3.Provider} reqProvider Web3 provider instance
   */
  setRequestProvider(reqProvider) {
    this.requestProvider = reqProvider;
  }

  getProvider() {
    return this.provider;
  }

  getRequestProvider() {
    return this.requestProvider;
  }

  /**
   * Returns injected provider settings
   * @private
   * @returns {Object} Current provider settings
   */
  getProviderSettings() {
    return this.getProvider().settings;
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

import { Emmiter, InpageProvider, Dialog, Bridge } from '@/class';
import createInpageProvider from '@/util/createInpageProvider';

export default class Context {
  /**
   * @param {String} options.authUrl Url of hosted Endpass Connect Application
   */
  constructor(options = {}) {
    this.authUrl = options.authUrl || 'https://auth.endpass.com';

    this.emitter = new Emmiter();
    this.provider = new InpageProvider(this.emitter);

    this.requestProvider = null;
    this.currentRequest = null;

    this.dialog = null;
    this.bridge = null;
  }

  /**
   * Define Dialog instance
   * @param {props} props properties for instance
   */
  initDialog(props) {
    this.dialog = new Dialog(props);
  }

  /**
   * Define Bridge instance
   * @param {props} props properties for instance
   */
  initBridge(props) {
    this.bridge = new Bridge(props);
  }

  /**
   * Create InpageProvider
   * @param {Web3.Provider} provider Web3-friendly provider
   * @param {url} url for provider
   */
  createInpageProvider(provider, url) {
    this.provider = createInpageProvider({
      emitter: this.getEmitter(),
      url,
      provider,
    });
  }

  /**
   * Define Current request
   * @param {Object} request Incoming request
   */
  setCurrentRequest(request) {
    this.currentRequest = request;
  }

  /**
   * Define Current request
   * @param {Web3.Provider} reqProvider Web3 provider instance
   */
  setRequestProvider(reqProvider) {
    this.requestProvider = reqProvider;
  }

  getCurrentRequest() {
    return this.currentRequest;
  }

  getProvider() {
    return this.provider;
  }

  getRequestProvider() {
    return this.requestProvider;
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

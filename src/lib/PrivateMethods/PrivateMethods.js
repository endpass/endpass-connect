import omit from 'lodash/omit';
import get from 'lodash/get';

import {
  METHODS,
  INPAGE_EVENTS,
  DAPP_WHITELISTED_METHODS,
  DEFAULT_NETWORKS,
} from '@/constants';

export default class PrivateMethods {
  /**
   * @param {Context} context instance of connect
   */
  constructor(context) {
    this.context = context;

    // Net requests queue
    this.queueInterval = null;
    this.queue = [];

    this.initBridge();
    this.setupEmmiterEvents();
    this.subscribeOnRequestsQueueChanges();
  }

  /**
   * Sets interval and checks queue for new requests. If current request is not
   * present – sets it and then process
   * @private
   */
  subscribeOnRequestsQueueChanges() {
    this.queueInterval = setInterval(() => {
      if (!this.context.getCurrentRequest() && this.queue.length > 0) {
        const req = this.queue.pop();
        this.context.setCurrentRequest(req);
        this.processCurrentRequest();
      }
    }, 2000);
  }

  /**
   * Process current request
   * If request method present in whitelist – it should be signed by user
   * In other cases request will be send to network with web3
   * In the both cases – result will be passed back to injected provider
   * @private
   * @returns {Promise<Object>} Request processing result
   */
  async processCurrentRequest() {
    const { context } = this;
    const currentRequest = context.getCurrentRequest();

    try {
      const res = DAPP_WHITELISTED_METHODS.includes(currentRequest.method)
        ? await this.processWhitelistedRequest()
        : await this.sendToNetwork();

      this.sendResponse(res);
    } catch (err) {
      this.sendResponse({
        ...currentRequest,
        result: null,
        error: err,
      });
    } finally {
      context.setCurrentRequest(null);
    }
  }

  /**
   * Process request which contains method from whitelist
   * If request means recovery – recover address and returns address
   * In other cases – sign and returns signature
   * @private
   * @returns {Promise<String>} Recovered address or signature
   */
  processWhitelistedRequest() {
    if (this.context.getCurrentRequest().method === 'personal_ecRecover') {
      return this.recover();
    }

    return this.sign();
  }

  /**
   * Sets event listeners to inner emitter with handlers
   * @private
   */
  setupEmmiterEvents() {
    const { context } = this;
    context
      .getEmitter()
      .on(INPAGE_EVENTS.REQUEST, this.handleRequest.bind(this));
    context
      .getEmitter()
      .on(INPAGE_EVENTS.SETTINGS, this.handleRequest.bind(this));
  }

  /**
   * Injects iframe-bridge to opened page and returns link to injected element
   * @private
   * @returns {HTMLElement} Injected iframe element
   */
  initBridge() {
    const { context } = this;
    const url = context.getConnectUrl('bridge');
    context.initBridge({ url });
    context.getBridge().mount();
  }

  /**
   * Requests user settings from connect application
   * @private
   * @throws {Error} If settings request failed
   * @returns {Promise<Object>} User settings
   */
  async getUserSettings() {
    const res = await this.context.getBridge().ask({
      method: METHODS.GET_SETTINGS,
    });

    if (!res.status) {
      throw new Error(res.message || 'User settings are not received!');
    }

    return res;
  }

  /**
   * Opens application with given route in child window
   * Also awaits ready state message from dialog
   * After receiving message – returns link to opened window
   * @private
   * @param {String} route Target connect application route
   * @returns {Promise<Window>} Opened child window
   */
  async openApp(route = '') {
    const { context } = this;
    const url = context.getConnectUrl(route);

    context.initDialog({ url });

    await context.getDialog().open();
  }

  /**
   * Sends current request to network with request provider and returns result
   * @private
   * @returns {Promise<Object>} Result from network
   */
  async sendToNetwork() {
    const { context } = this;
    return new Promise((resolve, reject) => {
      const reqProvider = context.getRequestProvider();
      reqProvider.sendAsync(context.getCurrentRequest(), (err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve(res);
      });
    });
  }

  /**
   * Handle requests and push them to the requests queue
   * @private
   * @param {Object} request Incoming request
   */
  handleRequest(request) {
    if (request.id) this.queue.push(request);
  }

  /**
   * Returns injeted provider settings
   * @private
   * @returns {Object} Current provider settings
   */
  getSettings() {
    return this.context.getProvider().settings;
  }

  /**
   * Sends response to injected provider
   * @private
   * @param {Object} payload Response payload object
   */
  sendResponse(payload) {
    if (payload.error) {
      console.error(`Request have return error: ${payload.error}`);
    }

    this.context.getEmitter().emit(INPAGE_EVENTS.RESPONSE, payload);
  }

  /**
   * Creates requsts provider and save it to the instance property
   * @private
   * @param {Web3.Provider} Provider Web3 provider class
   */
  createRequestProvider(Provider) {
    const { activeNet } = this.getSettings();

    const reqProvider = new Provider(
      get(DEFAULT_NETWORKS, `${activeNet}.url[0]`),
    );
    this.context.setRequestProvider(reqProvider);
  }

  // TODO: Not ready yet (>= web3 1.0.0-beta.40 support)
  createInpageProvider(provider) {
    const { activeNet } = this.getSettings();
    const url = get(DEFAULT_NETWORKS, `${activeNet}.url[0]`);

    this.context.createInpageProvider(provider, url);
  }

  /**
   * Sends current request to connect application dialog, opens it and
   * awaits sign result
   * @private
   * @returns {Promise<Object>} Sign result
   */
  async sign() {
    const { context } = this;
    await this.openApp('sign');

    const { activeAccount, activeNet } = this.getSettings();
    const dialog = context.getDialog();
    const res = await dialog.ask({
      method: METHODS.SIGN,
      url: window.location.origin,
      address: activeAccount,
      net: activeNet,
      request: context.getCurrentRequest(),
    });

    dialog.close();

    if (!res.status) throw new Error(res.message || 'Sign error!');

    return omit(res, ['status']);
  }

  /**
   * Recovers current request and returns recovered address
   * @public
   * @throws {Error} If recovery failed
   * @returns {Promise<String>} Recovered address
   */
  async recover() {
    const { context } = this;
    const { activeAccount, activeNet } = this.getSettings();
    const res = await context.getBridge().ask({
      method: METHODS.RECOVER,
      address: activeAccount,
      net: activeNet,
      request: context.getCurrentRequest(),
    });

    if (!res.status) throw new Error(res.message || 'Recovery error!');

    return omit(res, ['status']);
  }
}

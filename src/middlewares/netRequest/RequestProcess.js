import omit from 'lodash/omit';

import { METHODS, INPAGE_EVENTS, DAPP_WHITELISTED_METHODS } from '@/constants';

export default class RequestProcess {
  constructor(context, req) {
    this.context = context;
    this.currentRequest = req;
  }

  /**
   * Process current request
   * If request method present in whitelist – it should be signed by user
   * In other cases request will be send to network with web3
   * In the both cases – result will be passed back to injected provider
   * @returns {Promise<Object>} RequestProcess processing result
   */
  async doProcess() {
    const { currentRequest } = this;

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
    }
  }

  /**
   * Process request which contains method from whitelist
   * If request means recovery – recover address and returns address
   * In other cases – sign and returns signature
   * @returns {Promise<String>} Recovered address or signature
   */
  processWhitelistedRequest() {
    if (this.currentRequest.method === 'personal_ecRecover') {
      return this.recover();
    }

    return this.sign();
  }

  /**
   * Sets event listeners to inner emitter with handlers
   */
  setupEmitterEvents() {
    const { context } = this;
    context
      .getEmitter()
      .on(INPAGE_EVENTS.REQUEST, this.handleRequest.bind(this));
    context
      .getEmitter()
      .on(INPAGE_EVENTS.SETTINGS, this.handleRequest.bind(this));
  }

  /**
   * Sends current request to network with request provider and returns result
   * @returns {Promise<Object>} Result from network
   */
  async sendToNetwork() {
    const { context } = this;
    return new Promise((resolve, reject) => {
      const reqProvider = context.getRequestProvider();
      reqProvider.sendAsync(this.currentRequest, (err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve(res);
      });
    });
  }

  /**
   * Handle requests and push them to the requests queue
   * @param {Object} request Incoming request
   */
  handleRequest(request) {
    if (request.id) this.queue.push(request);
    this.nextTick();
  }

  /**
   * Sends response to injected provider
   * @param {Object} payload Response payload object
   */
  sendResponse(payload) {
    if (payload.error) {
      console.error(`Request have return error: ${payload.error}`);
    }

    this.context.getEmitter().emit(INPAGE_EVENTS.RESPONSE, payload);
  }

  /**
   * Sends current request to connect application dialog, opens it and
   * awaits sign result
   * @returns {Promise<Object>} Sign result
   */
  async sign() {
    const { context } = this;
    await context.openApp('sign');

    const { activeAccount, activeNet } = context.getProviderSettings();
    const dialog = context.getDialog();
    const res = await dialog.ask({
      method: METHODS.SIGN,
      url: window.location.origin,
      address: activeAccount,
      net: activeNet,
      request: this.currentRequest,
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
    const { activeAccount, activeNet } = context.getProviderSettings();
    const res = await context.getBridge().ask({
      method: METHODS.RECOVER,
      address: activeAccount,
      net: activeNet,
      request: this.currentRequest,
    });

    if (!res.status) throw new Error(res.message || 'Recovery error!');

    return omit(res, ['status']);
  }
}

import ConnectError from '@endpass/class/ConnectError';
import {
  MESSENGER_METHODS,
  INPAGE_EVENTS,
  DAPP_WHITELISTED_METHODS,
} from '@/constants';

const { ERRORS } = ConnectError;

export default class RequestProcess {
  constructor({ context, request, settings = {}, pluginProvider }) {
    this.context = context;
    this.currentRequest = request;
    this.settings = settings;
    this.pluginProvider = pluginProvider;
  }

  /**
   * Start process current request
   * If request method present in whitelist – it should be signed by user
   * In other cases request will be send to network with web3
   * In the both cases – result will be passed back to injected provider
   * @returns {Promise<Object>} RequestProcess processing result
   */
  async start() {
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
   * Sends current request to network with request provider and returns result
   * @returns {Promise<Object>} Result from network
   */
  async sendToNetwork() {
    return new Promise((resolve, reject) => {
      const reqProvider = this.pluginProvider.getRequestProvider();
      const req = this.currentRequest;
      reqProvider.send(req, (err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve(res);
      });
    });
  }

  /**
   * Sends response to injected provider
   * @param {Object} payload Response payload object
   */
  sendResponse(payload) {
    if (payload.error) {
      console.error(`Request have return error: ${payload.error}`);
    }

    this.pluginProvider.emitter.emit(INPAGE_EVENTS.RESPONSE, payload);
  }

  /**
   * Sends current request to connect application dialog, opens it and
   * awaits sign result
   * @returns {Promise<Object>} Sign result
   */
  async sign() {
    const { activeAccount, activeNet } = this.settings;

    const res = await this.context.ask(MESSENGER_METHODS.SIGN, {
      url: window.location.origin,
      address: activeAccount,
      net: activeNet,
      request: this.currentRequest,
    });

    if (!res.status) {
      throw ConnectError.create(res.error || ERRORS.SIGN);
    }

    return res.payload;
  }

  /**
   * Recovers current request and returns recovered address
   * @public
   * @throws {Error} If recovery failed
   * @returns {Promise<String>} Recovered address
   */
  async recover() {
    const { activeAccount, activeNet } = this.settings;
    const res = await this.context.ask(MESSENGER_METHODS.RECOVER, {
      address: activeAccount,
      net: activeNet,
      request: this.currentRequest,
    });

    if (!res.status) {
      throw ConnectError.create(res.error || ERRORS.RECOVERY);
    }

    return res.payload;
  }
}

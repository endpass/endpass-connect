import get from 'lodash.get';
import Network from '@endpass/class/Network';
import ConnectError from '@endpass/class/ConnectError';
import Emmiter from './Emmiter';
import { INPAGE_EVENTS, INPAGE_ID_PREFIX, WEB3_METHODS } from '@/constants';
import processPayload from '@/util/processPayload';

const { ERRORS } = ConnectError;

export default class InpageProvider extends Emmiter {
  constructor(eventEmitter) {
    super();
    if (!(eventEmitter instanceof Emmiter)) {
      throw ConnectError.create(ERRORS.EVENT_EMITTER_NOT_PROVIDED);
    }

    this.eventEmitter = eventEmitter;
    this.pendingRequestsHandlers = {};
    this.settings = {
      activeAccount: null,
      activeNet: Network.NET_ID.MAIN,
    };
    this.isMetaMask = true;

    this.enable = this.enable.bind(this);

    this.setupEventsHandlers();
  }

  get networkVersion() {
    return this.settings.activeNet;
  }

  get selectedAddress() {
    return this.settings.activeAccount;
  }

  static createInpageIdFromRequestId(id) {
    return `${INPAGE_ID_PREFIX}${id}`;
  }

  static restoreRequestIdFromInpageId(id) {
    return parseInt(id.replace(INPAGE_ID_PREFIX, ''), 10);
  }

  isConnected() {
    return true;
  }

  setupEventsHandlers() {
    this.eventEmitter.on(
      INPAGE_EVENTS.SETTINGS,
      this.handleSettings.bind(this),
    );
    this.eventEmitter.on(
      INPAGE_EVENTS.RESPONSE,
      this.handleResponse.bind(this),
    );
    this.eventEmitter.on(
      INPAGE_EVENTS.DROP_PENDING,
      this.handleDropPending.bind(this),
    );
  }

  handleDropPending({ id }) {
    const requestId = InpageProvider.restoreRequestIdFromInpageId(id);
    delete this.pendingRequestsHandlers[requestId];
  }

  handleResponse({ error, id, result, jsonrpc }) {
    const requestId = InpageProvider.restoreRequestIdFromInpageId(id);
    const requestHandler = get(this.pendingRequestsHandlers, requestId);

    if (requestHandler) {
      let errorMessage;
      const response = {
        id: parseInt(requestId, 10),
        jsonrpc,
      };

      if (error) {
        Object.assign(response, { error });
        errorMessage = error.message;
      } else {
        Object.assign(response, { result });
      }

      requestHandler(errorMessage, response);
      this.handleDropPending({ id });
    }
  }

  handleSettings(payload) {
    const { activeAccount, activeNet } = payload;

    if (activeAccount !== this.settings.activeAccount) {
      this.settings.activeAccount = activeAccount;
      this.emit('accountsChanged', [activeAccount]);
    }

    if (activeNet !== this.settings.activeNet) {
      this.settings.activeNet = activeNet;
      this.emit('accountsChanged', activeNet);
    }
  }

  sendAsync(payload, callback) {
    const payloadId = payload.id;
    this.pendingRequestsHandlers[payloadId] = callback;
    this.eventEmitter.emit(INPAGE_EVENTS.REQUEST, {
      ...payload,
      id: InpageProvider.createInpageIdFromRequestId(payloadId),
    });
  }

  send(payload, callback) {
    if (callback) {
      this.sendAsync(payload, callback);
    } else {
      const res = processPayload(payload, this.settings);
      if (payload.method === WEB3_METHODS.ETH_UNINSTALL_FILTER) {
        this.sendAsync(payload, () => {});
      }
      return res;
    }
  }

  getEthAccounts() {
    return [this.settings.activeAccount];
  }

  async enable() {
    return new Promise((resolve, reject) => {
      this.eventEmitter.once(INPAGE_EVENTS.LOGGED_IN, ({ error }) => {
        if (error) {
          return reject(error);
        }
        const res = this.getEthAccounts();
        return resolve(res);
      });
      this.eventEmitter.emit(INPAGE_EVENTS.LOGIN);
    });
  }
}

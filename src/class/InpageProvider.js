import get from 'lodash/get';
import Emmiter from './Emmiter';
import { INPAGE_EVENTS, INPAGE_ID_PREFIX } from '@/constants';
import processPayload from './processPayload';

export default class InpageProvider {
  constructor(eventEmitter) {
    if (!(eventEmitter instanceof Emmiter)) {
      throw new Error('Event emitter is not provided');
    }

    this.eventEmitter = eventEmitter;
    this.pendingRequestsHandlers = {};
    this.settings = {
      activeAccount: null,
      activeNet: null,
    };
    this.isMetaMask = true;
    this.isConnected = () => true;
    this.enable = this.enable.bind(this);

    this.setupEventsHandlers();
  }

  static createInpageIdFromRequestId(id) {
    return `${INPAGE_ID_PREFIX}${id}`;
  }

  static restoreRequestIdFromInpageId(id) {
    return parseInt(id.replace(INPAGE_ID_PREFIX, ''), 10);
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
  }

  handleResponse({ error, id, result, jsonrpc }) {
    const requestId = InpageProvider.restoreRequestIdFromInpageId(id);
    const requestHandler = get(this.pendingRequestsHandlers, requestId);

    if (requestHandler) {
      requestHandler(error, {
        id: parseInt(requestId, 10),
        result,
        jsonrpc,
      });

      delete this.pendingRequestsHandlers[requestId];
    }
  }

  handleSettings(payload) {
    const { activeAccount, activeNet } = payload;

    if (activeAccount) {
      this.settings.activeAccount = activeAccount;
    }

    if (activeNet) {
      this.settings.activeNet = activeNet;
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

  send(payload) {
    return processPayload(payload, this.settings);
  }

  async enable() {
    return processPayload({ method: 'eth_accounts' }, this.settings).result;
  }
}

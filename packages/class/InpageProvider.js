import { get } from 'lodash';
import Emmiter from './Emmiter';

export default class InpageProvider {
  constructor(eventEmitter) {
    if (!(eventEmitter instanceof Emmiter)) {
      throw new Error('Event emitter is not provided');
    }

    this.eventEmitter = eventEmitter;
    this.pendingRequestsHandlers = {};
    this.settings = {};
    this.isMetaMask = true;
    this.isConnected = () => true;
    this.enable = this.enable.bind(this);
    this.setupEventsHandlers();
  }

  static INPAGE_EVENT = {
    SETTINGS: 'INPAGE_PROVIDER_SETTINGS_EVENT',
    RESPONSE: 'INPAGE_PROVIDER_RESPONSE_EVENT',
    REQUEST: 'INPAGE_PROVIDER_REQUEST_EVENT',
  };

  static INPAGE_ID_PREFIX = 'ep_';

  static createInpageIdFromRequestId(id) {
    return `${this.INPAGE_ID_PREFIX}${id}`;
  }

  static restoreRequestIdFromInpageId(id) {
    return parseInt(id.replace(this.INPAGE_ID_PREFIX, ''), 10);
  }

  setupEventsHandlers() {
    this.eventEmitter.on(
      this.INPAGE_EVENT.SETTINGS,
      this.handleSettings.bind(this),
    );
    this.eventEmitter.on(
      this.INPAGE_EVENT.RESPONSE,
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
    const { selectedAddress, networkVersion } = payload;

    if (selectedAddress) {
      this.settings.selectedAddress = selectedAddress;
    }

    if (networkVersion) {
      this.settings.networkVersion = networkVersion;
    }
  }

  processPayload(payload) {
    let result = null;

    switch (payload.method) {
      case 'eth_accounts':
        result = this.settings.selectedAddress
          ? [this.settings.selectedAddress]
          : [];
        break;
      case 'eth_coinbase':
        result = this.settings.selectedAddress || null;
        break;
      case 'eth_uninstallFilter':
        this.sendAsync(payload, () => {});
        result = true;
        break;
      case 'net_version':
        result = this.settings.networkVersion || null;
        break;
      default:
        break;
    }

    return {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
      result,
    };
  }

  sendAsync(payload, callback) {
    const processedPayload = this.processPayload({ ...payload });

    if (processedPayload.result !== null) {
      callback(null, processedPayload);
    } else {
      this.pendingRequestsHandlers[payload.id] = callback;
      this.eventEmitter.emit(this.INPAGE_EVENT.REQUEST, {
        ...payload,
        id: InpageProvider.createInpageIdFromRequestId(payload.id),
      });
    }
  }

  send(payload) {
    return this.processPayload(payload);
  }

  async enable() {
    return this.processPayload({ method: 'eth_accounts' }).result;
  }
}

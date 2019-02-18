import { INPAGE_EVENTS } from '@/constants';
import itemStates from './itemStates';

const QUEUE_TIMEOUT = 2000; // 2 sec

function setPayload(res) {
  this.payload = res;
}

function setState(state) {
  this.state = state;
}

export default class Queue {
  /**
   * @param {Context} context instance of connect
   * @param {Object} options Queue options
   */
  constructor(context, options = {}) {
    this.middleWares = options.middleWares || [];
    this.context = context;

    this.handleRequest = this.handleRequest.bind(this);

    // Setup net requests queue
    this.queueTimeout = null;
    this.queue = [];

    // start queue
    this.setupEmitterEvents();
    this.nextTick();
  }

  /**
   * Sets interval and checks queue for new requests. If current request is not
   * present – sets it and then process
   * @private
   */
  nextTick() {
    const { queue } = this;
    if (this.queueTimeout || queue.length === 0) {
      return;
    }

    this.queueTimeout = setTimeout(async () => {
      try {
        const { middleWares, context } = this;

        for (const fn of middleWares) {
          const item = queue[0];
          await fn(context, item, queue);
        }
      } catch (e) {
        console.error(e);
      }
      this.queueTimeout = null;
      this.nextTick();
    }, QUEUE_TIMEOUT);
  }

  /**
   * Sets event listeners to inner emitter with handlers
   */
  setupEmitterEvents() {
    const emi = this.context.getEmitter();
    emi.on(INPAGE_EVENTS.REQUEST, this.handleRequest);
    emi.on(INPAGE_EVENTS.SETTINGS, this.handleRequest);
  }

  /**
   * Handle requests and push them to the requests queue
   * @private
   * @param {Object} request Incoming request
   */
  handleRequest(request) {
    if (request.id) {
      const item = {
        request,
        state: itemStates.INITIAL,
        payload: null,
        setState,
        setPayload,
      };
      this.queue.push(item);
    }
    this.nextTick();
  }
}

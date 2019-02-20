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
   * @param {Array} options.middleware middleware for process queue
   */
  constructor(context, options = {}) {
    this.middleware = options.middleware || [];
    this.context = context;

    this.handleRequest = this.handleRequest.bind(this);

    // Setup net requests queue
    this.queueTimeout = null;
    this.queue = [];

    // start queue
    this.setupEventEmitter();
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
        const { middleware, context } = this;
        let item;
        for (const fn of middleware) {
          item = queue[0];
          await fn(context, item, queue);

          if (item.state === itemStates.END) {
            break;
          }
        }
        if (item && item.state !== itemStates.REPEAT) {
          queue.shift();
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
  setupEventEmitter() {
    const emitter = this.context.getEmitter();
    emitter.on(INPAGE_EVENTS.REQUEST, this.handleRequest);
    emitter.on(INPAGE_EVENTS.SETTINGS, this.handleRequest);
  }

  /**
   * Handle requests and push them to the requests queue
   * @private
   * @param {Object} request Incoming request
   */
  handleRequest(request) {
    if (request.id) {
      const { queue } = this;
      const settings = this.context.getInpageProviderSettings();
      const item = {
        request,
        state: itemStates.INITIAL,
        payload: null,
        settings,
        end: () => {
          item.setState(itemStates.END);
        },
        setState,
        setPayload,
      };
      queue.push(item);
    }
    this.nextTick();
  }
}

import { INPAGE_EVENTS } from '@/constants';

const QUEUE_TIMEOUT = 1000; // 1 sec

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
    const { queue, middleWares, context } = this;
    if (this.queueTimeout || queue.length === 0) {
      return;
    }

    this.queueTimeout = setTimeout(async () => {
      try {
        for (const fn of middleWares) {
          await fn(context, queue);
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
    const { context } = this;
    context.getEmitter().on(INPAGE_EVENTS.REQUEST, this.handleRequest);
    context.getEmitter().on(INPAGE_EVENTS.SETTINGS, this.handleRequest);
  }

  /**
   * Handle requests and push them to the requests queue
   * @private
   * @param {Object} request Incoming request
   */
  handleRequest(request) {
    if (request.id) this.queue.push(request);
    this.nextTick();
  }
}

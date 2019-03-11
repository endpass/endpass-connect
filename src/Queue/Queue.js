import { INPAGE_EVENTS } from '@/constants';
import { AsyncQueue } from '@/class';
import itemStates from './itemStates';

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
    this.queue = new AsyncQueue();

    // start queue
    this.setupEventEmitter();
    this.initRequestHandlerLoop();
  }

  /**
   * Handle requests from the queue using middleware
   * @private
   */
  async initRequestHandlerLoop() {
    const { queue } = this;

    // eslint-disable-next-line no-restricted-syntax
    for await (const queueItem of queue) {
      try {
        const { middleware, context } = this;

        // eslint-disable-next-line no-restricted-syntax
        for (const fn of middleware) {
          // eslint-disable-next-line no-await-in-loop
          await fn(context, queueItem);

          if (queueItem.state === itemStates.END) {
            break;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  /**
   * Sets event listeners to inner emitter with handlers
   * @private
   */
  setupEventEmitter() {
    const emitter = this.context.getEmitter();
    emitter.on(INPAGE_EVENTS.REQUEST, this.handleRequest);
    emitter.on(INPAGE_EVENTS.SETTINGS, this.handleRequest);
  }

  /**
   * Transform requests and put them to the requests queue
   * @private
   * @param {Object} request Incoming request
   */
  handleRequest(request = {}) {
    if (!request.id) return;

    const settings = this.context.getInpageProviderSettings();
    const item = {
      request,
      state: itemStates.INITIAL,
      payload: null,
      settings,
      end() {
        this.setState(itemStates.END);
      },
      setPayload(res) {
        this.payload = res;
      },
      setState(state) {
        this.state = state;
      },
    };

    this.queue.put(item);
  }
}

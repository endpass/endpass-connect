// @ts-check
import { INPAGE_EVENTS } from '@/constants';
import { AsyncQueue } from '@/class';
import itemStates from './itemStates';

// eslint-disable-next-line no-unused-vars
import Context from '@/Context';

export default class Queue {
  /**
   * @param { InstanceType<typeof Context> } context instance of connect
   * @param { { middleware: import('@/types/Middleware').Middleware[]; } } options Queue options
   */
  constructor(context, options) {
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
    for await (const action of queue) {
      try {
        const { middleware, context } = this;

        // eslint-disable-next-line no-restricted-syntax
        for (const fn of middleware) {
          // eslint-disable-next-line no-await-in-loop
          await fn(context, action);

          if (action.state === itemStates.END) {
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
   * @typedef {import('@/types/json-rpc').RpcRequest} RpcRequest
   */
  /**
   * Transform requests and put them to the requests queue
   * @private
   * @param { RpcRequest | Object<string, any> } request Incoming request
   */
  handleRequest(request = {}) {
    if (!request.id) return;

    const settings = this.context.getInpageProviderSettings();

    /** @type import('@/types/QueueAction').QueueAction */
    const action = {
      /* eslint-disable-next-line */
      request: /** @type {RpcRequest} */ (request),
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

    this.queue.put(action);
  }
}

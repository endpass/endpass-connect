import { INPAGE_EVENTS } from '@/constants';

const QUEUE_TIMEOUT = 1000; // 1 sec

const QUEUE_ITEM_STATE = {
  repeat: 'repeat',
  finish: 'finish',
};

function onRepeat() {
  this.state = QUEUE_ITEM_STATE.repeat;
}

function onFinish() {
  this.state = QUEUE_ITEM_STATE.finish;
}

function setPayload(res) {
  this.payload = res;
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
        const item = queue[0];

        const isFinished = await this.processMiddleWares(item);
        if (isFinished) queue.shift();
      } catch (e) {
        console.error(e);
      }
      this.queueTimeout = null;
      this.nextTick();
    }, QUEUE_TIMEOUT);
  }

  async processMiddleWares(item) {
    const { queue, middleWares, context } = this;
    let isProcessed = true;

    for (const fn of middleWares) {
      await fn(context, item, queue);
      const { state } = item;
      if (state) {
        switch (state) {
          case QUEUE_ITEM_STATE.repeat:
            isProcessed = false;
            break;
          default:
        }

        break; // break for loop
      }
    }

    return isProcessed;
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
    if (request.id) {
      const item = {
        state: '',
        request,
        payload: null,
        repeat: onRepeat,
        finish: onFinish,
        setPayload,
      };
      this.queue.push(item);
    }
    this.nextTick();
  }
}

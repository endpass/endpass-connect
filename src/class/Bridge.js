import { METHODS } from '@/constants';
import Dialog from './Dialog';
import Widget from './Widget';

// TODO: move somewhere else
const MESSAGE_TYPE = 'endpass-cw-msgr';

/**
 * @callback Listener {import('@types/global').Listener}
 */

/**
 * @typedef {Object<string, Array<Listener>>} Resolvers
 */

export default class Bridge {
  /**
   * @param InstanceType<{import('@Context')} options.context Context link
   * @param {String} options.url Url for open dialog
   * @param {any} options.initialPayload initial data for Auth
   */
  constructor({ context, url, initialPayload }) {
    this.context = context;
    this.initialPayload = initialPayload;
    this.dialog = new Dialog({ context, url });
    this.widget = new Widget({
      context,
      // TODO: remove that
      url: `http://localhost:4000/public/widget`,
    });
    this.ready = false;

    /** @type Resolvers */
    this.readyResolvers = [];

    this.subscribeOnBroadcastMessages();
    this.initAuthMessenger();
    this.initWidgetMessenger();
  }

  subscribeOnBroadcastMessages() {
    const authMessenger = this.context.getMessenger();
    const widgetMessenger = this.context.getWidgetMessenger();

    window.addEventListener('message', ({ data }) => {
      if (
        data.messageType === MESSAGE_TYPE &&
        data.method === METHODS.BROADCAST
      ) {
        authMessenger.send(METHODS.BROADCAST, data);
        widgetMessenger.send(METHODS.BROADCAST, data);
      }
    });
  }

  initAuthMessenger() {
    const authMessenger = this.context.getMessenger();

    authMessenger.subscribe(METHODS.INITIATE, (payload, req) => {
      req.answer({
        ...this.initialPayload,
        source: 'dialog',
      });
    });
    authMessenger.subscribe(METHODS.READY_STATE_BRIDGE, () => {
      this.ready = true;
      this.readyResolvers.forEach(item => item(true));
      this.readyResolvers.length = 0;
    });
  }

  initWidgetMessenger() {
    const widgetMessenger = this.context.getWidgetMessenger();

    widgetMessenger.subscribe(METHODS.INITIATE, (payload, req) => {
      req.answer({
        ...this.initialPayload,
        source: 'widget',
      });
    });
    widgetMessenger.subscribe(METHODS.WIDGET_GET_SETTING, (payload, req) => {
      req.answer(this.context.inpageProvider.settings);
    });
    widgetMessenger.subscribe(METHODS.WIDGET_OPEN, ({ root }, req) => {
      this.widget.resize({ height: '100vh' });

      if (root) this.widget.emitFrameEvent('open');

      req.answer();
    });
    widgetMessenger.subscribe(METHODS.WIDGET_CLOSE, () => {
      this.widget.emitFrameEvent('close');
    });
    widgetMessenger.subscribe(METHODS.WIDGET_FIT, ({ height }) => {
      this.widget.resize({ height: `${height}px` });
    });
    widgetMessenger.subscribe(
      METHODS.WIDGET_CHANGE_ACCOUNT,
      ({ address }, req) => {
        this.context.setProviderSettings({
          activeAccount: address,
        });

        const updatedSettings = this.context.getProviderSettings();

        req.answer(updatedSettings);
      },
    );
  }

  mountWidget(parameters) {
    this.widget.mount(parameters);
  }

  unmountWidget() {
    this.widget.unmount();
  }

  /**
   * Checks bridge ready state
   * Ask messenger before til it give any answer and resolve promise
   * Also, it is caches ready state and in the next time just resolve returned
   * promise
   * @returns {Promise<Boolean>}
   */
  checkReadyState() {
    /* eslint-disable-next-line */
    return new Promise(async resolve => {
      if (this.ready) {
        return resolve(true);
      }

      this.readyResolvers.push(resolve);
    });
  }

  /**
   * Wrapper on sendMessage and awaitMessage methods
   * Send message with given payload and awaits answer on it
   * @param {String} method Method name
   * @param {Object} payload Message payload. Must includes method property
   * @returns {Promise<any>} Responded message payload
   */
  async ask(method, payload) {
    if (!method) {
      throw new Error('You should provide method into you question to bridge!');
    }

    await this.checkReadyState();

    const res = await this.context
      .getMessenger()
      .sendAndWaitResponse(method, payload);

    return res;
  }
}

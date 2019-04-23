import { METHODS } from '@/constants';
import Dialog from './Dialog';
import Widget from './Widget';

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
      url: this.context.getConnectUrl('public/widget'),
    });
    this.ready = false;

    /** @type Resolvers */
    this.readyResolvers = [];

    this.initAuthMessenger();
    this.initWidgetMessenger();
  }

  async handleLogoutMessage(msg, req) {
    try {
      await this.context.logout();

      this.widget.emitFrameEvent(WIDGET_EVENTS.LOGOUT);
      req.answer({
        status: true,
      });
    } catch (err) {
      req.answer({
        status: false,
        err,
      });
    }
  }

  /* eslint-disable-next-line */
  async handleSettingsChange(msg, req) {
    try {
      this.context.setProviderSettings({
        activeAccount: msg.address,
      });

      req.answer({
        status: true,
      });
    } catch (err) {
      req.answer({
        status: false,
        err,
      });
    }
  }

  initAuthMessenger() {
    const authMessenger = this.context.getDialogMessenger();

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
    authMessenger.subscribe(METHODS.LOGOUT_REQUEST, (msg, req) => {
      this.handleLogoutMessage(msg, req);
    });
    authMessenger.subscribe(METHODS.CHANGE_SETTINGS_REQUEST, (msg, req) => {
      this.handleSettingsChange(msg, req);
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

      if (root) this.widget.emitFrameEvent(WIDGET_EVENTS.OPEN);

      req.answer();
    });
    widgetMessenger.subscribe(METHODS.WIDGET_CLOSE, () => {
      this.widget.emitFrameEvent(WIDGET_EVENTS.CLOSE);
    });
    widgetMessenger.subscribe(METHODS.WIDGET_FIT, ({ height }) => {
      this.widget.resize({ height: `${height}px` });
    });
    widgetMessenger.subscribe(METHODS.WIDGET_UNMOUNT, () => {
      this.unmountWidget();
    });
    widgetMessenger.subscribe(METHODS.LOGOUT_REQUEST, (msg, req) => {
      this.handleLogoutMessage(msg, req);
    });
    widgetMessenger.subscribe(METHODS.CHANGE_SETTINGS_REQUEST, (msg, req) => {
      this.handleSettingsChange(msg, req);
    });
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
      .getDialogMessenger()
      .sendAndWaitResponse(method, payload);

    return res;
  }
}

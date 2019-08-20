import ConnectError from '@endpass/class/ConnectError';
import { METHODS, DIRECTION, WIDGET_EVENTS } from '@/constants';
import Dialog from './Dialog';
import Widget from './Widget';

const { ERRORS } = ConnectError;

/**
 * @callback Listener {import('@types/global').Listener}
 */

export default class Bridge {
  /**
   * @param InstanceType<{import('@Context')} options.context Context link
   * @param {string} options.url Url for open dialog
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

    this.initDialogEvents();
  }

  async handleLogoutMessage(source, req) {
    try {
      await this.context.logout();

      this.widget.emitFrameEvent(WIDGET_EVENTS.LOGOUT);

      req.answer({
        status: true,
        source,
      });
    } catch (err) {
      req.answer({
        status: false,
        error: err,
        code: (err && err.code) || ERRORS.AUTH_LOGOUT,
      });
    }
  }

  /* eslint-disable-next-line */
  async handleSettingsChange(msg, req) {
    try {
      this.context.setProviderSettings(msg);

      this.widget.emitFrameEvent(WIDGET_EVENTS.UPDATE, msg);

      req.answer({
        status: true,
      });
    } catch (err) {
      req.answer({
        status: false,
        error: err,
        code: (err && err.code) || ERRORS.ACCOUNT_UPDATE,
      });
    }
  }

  initDialogEvents() {
    const dialogMessenger = this.dialog.getDialogMessenger();

    dialogMessenger.subscribe(METHODS.INITIATE, (payload, req) => {
      req.answer({
        ...this.initialPayload,
        source: DIRECTION.AUTH,
      });
    });
    dialogMessenger.subscribe(METHODS.LOGOUT_REQUEST, (msg, req) => {
      this.handleLogoutMessage(DIRECTION.AUTH, req);
    });
    dialogMessenger.subscribe(METHODS.CHANGE_SETTINGS_REQUEST, (msg, req) => {
      this.handleSettingsChange(msg, req);
    });
  }

  initWidgetEvents() {
    const widgetMessenger = this.context.getWidgetMessenger();

    widgetMessenger.subscribe(METHODS.INITIATE, (payload, req) => {
      req.answer({
        ...this.initialPayload,
        source: DIRECTION.WIDGET,
      });
    });
    widgetMessenger.subscribe(METHODS.WIDGET_GET_SETTING, (payload, req) => {
      req.answer(this.context.inpageProvider.settings);
    });
    widgetMessenger.subscribe(METHODS.LOGOUT_REQUEST, (msg, req) => {
      this.handleLogoutMessage(DIRECTION.WIDGET, req);
    });
    widgetMessenger.subscribe(METHODS.CHANGE_SETTINGS_REQUEST, (msg, req) => {
      this.handleSettingsChange(msg, req);
    });
    widgetMessenger.subscribe(METHODS.WIDGET_UNMOUNT, () => {
      this.context.unmountWidget();
    });
  }

  async getWidgetNode() {
    const res = await this.widget.getWidgetNode();

    return res;
  }

  isWidgetMounted() {
    return this.widget.isWidgetMounted();
  }

  /**
   * @param {object} [parameters]
   * @returns {Element}
   */
  mountWidget(parameters) {
    this.initWidgetEvents();

    return this.widget.mount(parameters);
  }

  unmountWidget() {
    const widgetMessenger = this.context.getWidgetMessenger();

    widgetMessenger.unsubscribe(METHODS.INITIATE);
    widgetMessenger.unsubscribe(METHODS.WIDGET_GET_SETTING);
    widgetMessenger.unsubscribe(METHODS.LOGOUT_REQUEST);
    widgetMessenger.unsubscribe(METHODS.CHANGE_SETTINGS_REQUEST);
    widgetMessenger.unsubscribe(METHODS.WIDGET_UNMOUNT);

    this.widget.unmount();
  }

  async ask(method, payload) {
    if (!method) {
      throw ConnectError.create(ERRORS.BRIDGE_PROVIDE_METHOD);
    }

    const res = await this.dialog.ask(method, payload);

    return res;
  }
}

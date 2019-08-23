import ConnectError from '@endpass/class/ConnectError';
import { METHODS, DIRECTION, WIDGET_EVENTS } from '@/constants';

const { ERRORS } = ConnectError;

export default class ElementsSubscriber {
  /**
   * @param {object} options
   * @param InstanceType<{import('@Context')} options.context Context link
   * @param {string} options.url Url for open dialog
   * @param {any} options.initialPayload initial data for Auth
   */
  constructor({ context, initialPayload }) {
    this.context = context;
    this.initialPayload = initialPayload;
  }

  async handleLogoutMessage(source, req) {
    try {
      await this.context.logout();

      this.context.getWidget().emitFrameEvent(WIDGET_EVENTS.LOGOUT);

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

      this.context.getWidget().emitFrameEvent(WIDGET_EVENTS.UPDATE, msg);

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

  subscribeElements() {
    this.subscribeDialog();
    this.subscribeWidget();
  }

  subscribeDialog() {
    const dialogMessenger = this.context.getDialog().getDialogMessenger();

    dialogMessenger.subscribe(METHODS.AUTH_STATUS, payload => {
      this.context.getAuthRequester().isLogin = payload;
    });

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

  subscribeWidget() {
    const widgetMessenger = this.context.getWidget().getWidgetMessenger();

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
      this.context.getWidget().unmount();
    });
  }
}

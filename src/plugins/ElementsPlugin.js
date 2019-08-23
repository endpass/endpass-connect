import Widget from '@/class/Widget';
import Dialog from '@/class/Dialog';
import ElementsSubscriber from '@/class/ElementsSubscriber';
import { getAuthUrl, getFrameRouteUrl } from '@/util/url';
import { DEFAULT_AUTH_URL } from '@/constants';
import MessengerGroup from '@/class/MessengerGroup';
import Plugin from '@/plugins/Plugin';

const WIDGET_AUTH_TIMEOUT = 200;

export default class ElementsPlugin extends Plugin {
  constructor(props) {
    super(props);
    const { options = {} } = props;
    const { namespace, authUrl } = options;
    const { demoData, isIdentityMode, showCreateAccount } = options;

    this.namespace = namespace || '';
    this.options = options;
    this.initialPayload = {
      demoData,
      isIdentityMode: isIdentityMode || false,
      showCreateAccount,
    };
    this.authUrl = getAuthUrl(authUrl || DEFAULT_AUTH_URL);
  }

  static getName() {
    return 'elements';
  }

  init() {
    const elementsSubscriber = new ElementsSubscriber({
      context: this.context,
      initialPayload: this.initialPayload,
    });
    elementsSubscriber.subscribeElements();
    this.setupWidgetOnAuth(this.options.widget);
  }

  setupWidgetOnAuth(options) {
    if (options === false) {
      return;
    }
    let timerId;

    const handler = () => {
      if (this.context.isLogin) {
        clearTimeout(timerId);
        this.getWidgetInstance().mount(options);
        return;
      }
      timerId = setTimeout(handler, WIDGET_AUTH_TIMEOUT);
    };
    handler();
  }

  /**
   *
   * @return {Dialog}
   */
  getDialogInstance() {
    if (!this.dialog) {
      this.dialog = new Dialog({
        namespace: this.namespace,
        url: getFrameRouteUrl(this.authUrl, 'bridge'),
      });
      this.getMessengerGroupInstance().addMessenger(
        this.dialog.getDialogMessenger(),
      );
    }

    return this.dialog;
  }

  /**
   *
   * @return {Widget}
   */
  getWidgetInstance() {
    if (!this.widget) {
      this.widget = new Widget({
        namespace: this.namespace,
        url: getFrameRouteUrl(this.authUrl, 'public/widget'),
        messengerGroup: this.getMessengerGroupInstance(),
      });
    }
    return this.widget;
  }

  /**
   *
   * @return {MessengerGroup}
   */
  getMessengerGroupInstance() {
    if (!this.messengerGroup) {
      this.messengerGroup = new MessengerGroup();
    }
    return this.messengerGroup;
  }
}

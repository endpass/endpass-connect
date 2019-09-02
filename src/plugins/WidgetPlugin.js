import Widget from '@/class/Widget';
import { getFrameRouteUrl } from '@/util/url';
import Plugin from '@/plugins/Plugin';

const WIDGET_AUTH_TIMEOUT = 200;

export default class WidgetPlugin extends Plugin {
  constructor(props) {
    super(props);
    const { options = {} } = props;

    this.options = options;
  }

  static getName() {
    return 'widget';
  }

  setupWidgetOnAuth(widget, options) {
    if (options === false) {
      return;
    }
    let timerId;

    const handler = async () => {
      clearTimeout(timerId);
      if (this.context.isLogin) {
        await this.mount(options);
        return;
      }
      timerId = setTimeout(handler, WIDGET_AUTH_TIMEOUT);
    };
    handler();
  }

  /**
   *
   * @return {Widget}
   */
  getWidgetInstance() {
    if (!this.widget) {
      this.widget = new Widget({
        namespace: this.options.namespace,
        initialPayload: this.context.getInitialPayload(),
        elementsSubscriber: this.context.getElementsSubscriber(),
        url: getFrameRouteUrl(this.context.getAuthUrl(), 'public/widget'),
        messengerGroup: this.context.getMessengerGroupInstance(),
      });
    }

    this.setupWidgetOnAuth(this.widget, this.options.widget);
    return this.widget;
  }
}

import Widget from '@/class/Widget';
import { getFrameRouteUrl } from '@/util/url';
import widgetHandlers from '@/class/Widget/widgetHandlers';
import PluginBase from './PluginBase';

const WIDGET_AUTH_TIMEOUT = 200;

export default class WidgetPlugin extends PluginBase {
  constructor(options) {
    super(options);
    this.options = options;
  }

  static get pluginName() {
    return 'widget';
  }

  handleEvent(payload, req) {
    if (!widgetHandlers[req.method]) {
      return;
    }
    widgetHandlers[req.method].apply(this.widget, [payload, req]);
  }

  get subscribeData() {
    const methodsNamesList = Object.keys(widgetHandlers);
    return [[this.widget.widgetMessenger, methodsNamesList]];
  }

  setupWidgetOnAuth(widget, options) {
    if (options === false) {
      return;
    }
    let timerId;

    const handler = async () => {
      clearTimeout(timerId);
      if (this.context.isLogin) {
        await widget.mount(options);
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
  get widget() {
    if (!this.widgetPrivate) {
      this.widgetPrivate = new Widget({
        namespace: this.options.namespace,
        url: getFrameRouteUrl(this.context.getAuthUrl(), 'public/widget'),
        messengerGroup: this.context.messengerGroup,
      });
      this.setupWidgetOnAuth(this.widgetPrivate, this.options.widgetPrivate);
    }

    return this.widgetPrivate;
  }
}

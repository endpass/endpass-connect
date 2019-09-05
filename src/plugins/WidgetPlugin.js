import Widget from '@/class/Widget';
import { getFrameRouteUrl } from '@/util/url';
import PluginBase from './PluginBase';

const WIDGET_AUTH_TIMEOUT = 200;

export default class WidgetPlugin extends PluginBase {
  constructor(options, context) {
    super(options, context);
    this.options = options;
  }

  static get pluginName() {
    return 'widget';
  }

  handleEvent(payload, req) {
    if (!this.widget.widgetHandlers[req.method]) {
      return;
    }
    this.widget.widgetHandlers[req.method](payload, req);
  }

  get subscribeData() {
    return [[this.widget.widgetMessenger]];
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

import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import debounce from 'lodash.debounce';
import {
  DIRECTION,
  MESSENGER_METHODS,
  PLUGIN_NAMES,
  WIDGET_EVENTS,
} from '@/constants';
import { inlineStyles } from '@/util/dom';
import {
  MOBILE_BREAKPOINT,
  FADE_TIMEOUT,
  getWidgetFrameStylesObject,
} from './WidgetStyles';
import StateCollapse from './states/StateCollapse';
import StateClose from './states/StateClose';
import widgetHandlers from './widgetHandlers';
import PluginBase from '@/plugins/PluginBase';
import { getFrameRouteUrl } from '@/util/url';
import WidgetPublicApi from '@/plugins/WidgetPlugin/WidgetPublicApi';

export default class WidgetPlugin extends PluginBase {
  static get pluginName() {
    return PLUGIN_NAMES.WIDGET;
  }

  static get handlers() {
    return widgetHandlers;
  }

  static get publicApi() {
    return WidgetPublicApi;
  }

  /**
   * @param {object} options
   * @param {import('@/class/Context').default} context
   * @param {string} options.namespace namespace
   * @param {string} options.url frame url
   */
  constructor(options, context) {
    super(options, context);
    const { authUrl } = options;

    this.url = getFrameRouteUrl(authUrl, 'public/widget');
    /** @type HTMLIFrameElement */
    this.frame = null;
    this.position = null;
    this.stateCompact = new StateCollapse(this);
    this.state = new StateClose(this);

    this.isMounted = false;
    this.isLoaded = false;
    this.isExpanded = false;

    this.handleWidgetFrameLoad = this.handleWidgetFrameLoad.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleScreenResize = this.handleScreenResize.bind(this);
    this.debouncedHandleScreenResize = debounce(this.handleScreenResize, 100);

    /** @type Array<Promise> */
    this.frameResolver = [];
  }

  get mountSettings() {
    return {
      position: this.position,
      isMobile: this.isMobile,
    };
  }

  get messenger() {
    if (!this.widgetMessenger) {
      const { namespace = '' } = this.options;
      this.widgetMessenger = new CrossWindowMessenger({
        // showLogs: !ENV.isProduction,
        name: `connect-widget[${namespace}]`,
        to: DIRECTION.AUTH,
        from: DIRECTION.CONNECT,
      });
      this.widgetMessenger.setTarget({});
    }
    return this.widgetMessenger;
  }

  get isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  onClose() {
    this.emitFrameEvent(this.frame, WIDGET_EVENTS.CLOSE);
  }

  onOpen(root) {
    this.resize({ height: '100vh' });

    if (root) this.emitFrameEvent(this.frame, WIDGET_EVENTS.OPEN);
  }

  onCollapse() {
    this.isExpanded = false;
    this.frame.style = this.getWidgetFrameInlineStyles();
  }

  onExpand() {
    this.isExpanded = true;
    this.handleDocumentClickOnce();
    this.frame.style = this.getWidgetFrameInlineStyles();
  }

  handleDocumentClick() {
    document.body.removeEventListener('click', this.handleDocumentClick);
    this.widgetMessenger.send(MESSENGER_METHODS.WIDGET_COLLAPSE_RESPONSE);
  }

  handleDocumentClickOnce() {
    document.body.addEventListener('click', this.handleDocumentClick);
  }

  /**
   * @param {HTMLElement} frame
   * @param {string} event
   * @param {any} [detail]
   */
  emitFrameEvent(frame, event, detail) {
    if (!frame) {
      return;
    }

    const frameEvent = new CustomEvent(event, {
      detail,
    });

    frame.dispatchEvent(frameEvent);
  }

  /**
   *
   * @param {object} parameters
   * @return {Promise<HTMLElement|*>}
   */
  async mount(parameters = {}) {
    if (this.isMounted) {
      const node = await this.getWidgetNode();
      return node;
    }
    this.isMounted = true;

    this.position = parameters.position || null;

    const styles = this.getWidgetFrameInlineStyles();
    const markup = `
      <iframe 
        id="endpass-widget" 
        data-test="widget-frame" 
        data-endpass="widget-frame" 
        style="${styles}" 
        src="${this.url}"
        ></iframe>
    `;

    document.body.insertAdjacentHTML('afterBegin', markup);

    this.frame = document.body.querySelector('[data-endpass="widget-frame"]');
    this.frame.addEventListener('load', this.handleWidgetFrameLoad);
    window.addEventListener('resize', this.debouncedHandleScreenResize);

    this.widgetMessenger.setTarget(this.frame.contentWindow);

    this.frameResolver.forEach(resolve => resolve(this.frame));
    this.frameResolver.length = 0;

    return this.frame;
  }

  async unmount() {
    if (!this.isMounted) return;

    this.isMounted = false;

    this.widgetMessenger.setTarget({});

    this.frame.style.opacity = 0;
    this.isLoaded = false;

    this.frame.removeEventListener('load', this.handleWidgetFrameLoad);
    window.removeEventListener('resize', this.debouncedHandleScreenResize);
    this.debouncedHandleScreenResize.cancel();

    const { frame } = this;
    this.frame = null;
    // Awaiting application animation ending
    setTimeout(() => {
      this.emitFrameEvent(frame, WIDGET_EVENTS.DESTROY);
      frame.remove();
    }, FADE_TIMEOUT);
  }

  handleWidgetFrameLoad() {
    this.emitFrameEvent(this.frame, WIDGET_EVENTS.MOUNT);
    this.isLoaded = true;
    this.frame.style = this.getWidgetFrameInlineStyles();
  }

  handleScreenResize() {
    this.widgetMessenger.send(MESSENGER_METHODS.WIDGET_CHANGE_MOBILE_MODE, {
      isMobile: this.isMobile,
    });
    this.frame.style = this.getWidgetFrameInlineStyles();
  }

  /**
   * @param {object} options
   * @param {string} options.height Height in px or other CSS/HTML friendly unit
   */
  resize({ height }) {
    if (height) {
      this.frame.style.height = height;
    }
  }

  /**
   *
   * @return {Promise<HTMLElement>}
   */
  getWidgetNode() {
    return new Promise(resolve => {
      if (this.frame) {
        resolve(this.frame);
        return;
      }
      this.frameResolver.push(resolve);
    });
  }

  getWidgetFrameInlineStyles() {
    const { isMobile, isExpanded, isLoaded, position } = this;
    const stylesObject = getWidgetFrameStylesObject({
      isMobile,
      isExpanded,
      isLoaded,
      position,
    });

    if (!this.frame) {
      return inlineStyles(stylesObject);
    }

    Object.assign(stylesObject, {
      height: `${this.frame.clientHeight}px`,
    });

    return inlineStyles(stylesObject);
  }
}

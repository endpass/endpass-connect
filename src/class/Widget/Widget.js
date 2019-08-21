import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import debounce from 'lodash.debounce';
import { DIRECTION, METHODS, WIDGET_EVENTS } from '@/constants';
import { inlineStyles } from '@/util/dom';
import {
  MOBILE_BREAKPOINT,
  FADE_TIMEOUT,
  getWidgetFrameStylesObject,
} from './WidgetStyles';

export default class Widget {
  /**
   * @param {object} options
   * @param {string} options.namespace namespace of connect
   * @param {string} options.url frame url
   */
  constructor({ namespace, messengerGroup, url }) {
    this.messengerGroup = messengerGroup;
    this.url = url;
    this.frame = null;
    this.position = null;

    this.isMounted = false;
    this.isLoaded = false;
    this.isExpanded = false;

    this.handleWidgetFrameLoad = this.handleWidgetFrameLoad.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleScreenResize = this.handleScreenResize.bind(this);
    this.debouncedHandleScreenResize = debounce(this.handleScreenResize, 100);
    this.widgetMessenger = new CrossWindowMessenger({
      showLogs: !ENV.isProduction,
      name: `connect-bridge-widget[${namespace}]`,
      to: DIRECTION.AUTH,
      from: DIRECTION.CONNECT,
    });
    this.frameResolver = [];
    this.subscribe();
  }

  /* eslint-disable-next-line */
  get isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  getWidgetMessenger() {
    return this.widgetMessenger;
  }

  subscribe() {
    const { widgetMessenger } = this;

    widgetMessenger.subscribe(METHODS.WIDGET_INIT, (payload, req) => {
      req.answer({
        position: this.position,
        isMobile: this.isMobile,
      });
    });

    widgetMessenger.subscribe(METHODS.WIDGET_EXPAND_REQUEST, (payload, req) => {
      this.isExpanded = true;
      this.handleDocumentClickOnce();
      this.frame.style = this.getWidgetFrameInlineStyles();
      req.answer();
    });
    widgetMessenger.subscribe(METHODS.WIDGET_COLLAPSE_REQUEST, () => {
      this.isExpanded = false;
      this.frame.style = this.getWidgetFrameInlineStyles();
    });

    widgetMessenger.subscribe(METHODS.WIDGET_OPEN, ({ root }, req) => {
      this.resize({ height: '100vh' });

      if (root) this.emitFrameEvent(WIDGET_EVENTS.OPEN);

      req.answer();
    });
    widgetMessenger.subscribe(METHODS.WIDGET_CLOSE, () => {
      this.emitFrameEvent(WIDGET_EVENTS.CLOSE);
    });
    widgetMessenger.subscribe(METHODS.WIDGET_FIT, ({ height }) => {
      this.resize({ height: `${height}px` });
    });
  }

  handleDocumentClick() {
    document.body.removeEventListener('click', this.handleDocumentClick);
    this.widgetMessenger.send(METHODS.WIDGET_COLLAPSE_RESPONSE);
  }

  handleDocumentClickOnce() {
    document.body.addEventListener('click', this.handleDocumentClick);
  }

  isWidgetMounted() {
    return this.isMounted;
  }

  emitFrameEvent(event, detail) {
    if (!this.frame) {
      return;
    }

    const frameEvent = new CustomEvent(event, {
      detail,
    });

    this.frame.dispatchEvent(frameEvent);
  }

  /**
   * Create markup and prepend to <body>
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
      <iframe id="endpass-widget" data-test="widget-frame" data-endpass="widget-frame" style="${styles}" src="${this.url}"></iframe>
    `;

    document.body.insertAdjacentHTML('afterBegin', markup);

    this.frame = document.body.querySelector('[data-endpass="widget-frame"]');
    this.frame.addEventListener('load', this.handleWidgetFrameLoad);
    window.addEventListener('resize', this.debouncedHandleScreenResize);

    this.widgetMessenger.setTarget(this.frame.contentWindow);

    this.messengerGroup.addMessenger(this.widgetMessenger);

    this.frameResolver.forEach(resolve => resolve(this.frame));
    this.frameResolver.length = 0;

    return this.frame;
  }

  unmount() {
    if (!this.isMounted) return;

    this.isMounted = false;

    this.messengerGroup.removeMessenger(this.widgetMessenger);

    this.frame.style.opacity = 0;
    this.isLoaded = false;

    this.frame.removeEventListener('load', this.handleWidgetFrameLoad);
    window.removeEventListener('resize', this.debouncedHandleScreenResize);
    this.debouncedHandleScreenResize.cancel();

    // Awaiting application animation ending
    setTimeout(() => {
      this.emitFrameEvent(WIDGET_EVENTS.DESTROY);
      this.frame.remove();
      this.frame = null;
    }, FADE_TIMEOUT);
  }

  handleWidgetFrameLoad() {
    this.emitFrameEvent(WIDGET_EVENTS.MOUNT);
    this.isLoaded = true;
    this.frame.style = this.getWidgetFrameInlineStyles();
  }

  handleScreenResize() {
    this.widgetMessenger.send(METHODS.WIDGET_CHANGE_MOBILE_MODE, {
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

  getWidgetNode() {
    return new Promise(resolve => {
      if (this.frame) {
        return resolve(this.frame);
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

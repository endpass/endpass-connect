import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import debounce from 'lodash.debounce';
import { DIRECTION, METHODS, WIDGET_EVENTS } from '@/constants';
import { inlineStyles } from '@/util/dom';
import {
  MOBILE_BREAKPOINT,
  FADE_TIMEOUT,
  INITIAL_FRAME_STYLES,
  FRAME_DESKTOP_STYLES,
  FRAME_MOBILE_COLLAPSED_STYLES,
  FRAME_MOBILE_EXPANDED_STYLES,
} from './WidgetStyles';

export default class Widget {
  /**
   * @param {object} options
   * @param {string} options.namespace namespace of connect
   * @param {string} options.url frame url
   */
  constructor({ namespace, url }) {
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
  mount(parameters = {}) {
    const { url } = this;

    this.position = parameters.position || null;
    this.isMounted = true;

    const styles = this.getWidgetFrameInlineStyles();
    const markup = `
      <iframe id="endpass-widget" data-test="widget-frame" data-endpass="widget-frame" style="${styles}" src="${url}"></iframe>
    `;

    document.body.insertAdjacentHTML('afterBegin', markup);

    this.frame = document.body.querySelector('[data-endpass="widget-frame"]');
    this.frame.addEventListener('load', this.handleWidgetFrameLoad);
    window.addEventListener('resize', this.debouncedHandleScreenResize);

    this.widgetMessenger.setTarget(this.frame.contentWindow);

    return this.frame;
  }

  unmount() {
    // const widgetMessenger = this.widgetMessenger;

    this.frame.style.opacity = 0;
    this.isLoaded = false;
    this.isMounted = false;

    // widgetMessenger.unsubscribe(METHODS.WIDGET_INIT);
    // widgetMessenger.unsubscribe(METHODS.WIDGET_EXPAND_REQUEST);
    // widgetMessenger.unsubscribe(METHODS.WIDGET_OPEN);
    // widgetMessenger.unsubscribe(METHODS.WIDGET_CLOSE);
    // widgetMessenger.unsubscribe(METHODS.WIDGET_FIT);

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
      const handler = cb => {
        if (this.frame) {
          cb(this.frame);
          return true;
        }
        setTimeout(() => {
          handler(cb);
        }, 250);
        return false;
      };

      handler(resolve);
    });
  }

  getWidgetFrameDesktopPositionStylesObject() {
    const { position = {} } = this;
    const actualPosition = {
      left: 'auto',
      right: 'auto',
      top: 'auto',
      bottom: 'auto',
      ...position,
    };

    if (actualPosition.left === 'auto' && actualPosition.right === 'auto') {
      Object.assign(actualPosition, {
        right: '15px',
      });
    }

    if (actualPosition.top === 'auto' && actualPosition.bottom === 'auto') {
      Object.assign(actualPosition, {
        bottom: '5px',
      });
    }

    return actualPosition;
  }

  /**
   * @returns {object}
   */
  getWidgetFrameStylesObject() {
    const { isMobile, isExpanded, isLoaded } = this;

    switch (true) {
      case isMobile && isLoaded && isExpanded:
        return {
          ...FRAME_MOBILE_EXPANDED_STYLES,
          opacity: Number(this.isLoaded),
        };
      case isMobile && isLoaded && !isExpanded:
        return {
          ...FRAME_MOBILE_COLLAPSED_STYLES,
          opacity: Number(this.isLoaded),
        };
      case isLoaded:
        return {
          ...FRAME_DESKTOP_STYLES,
          ...this.getWidgetFrameDesktopPositionStylesObject(),
          opacity: Number(this.isLoaded),
        };
      default:
        return INITIAL_FRAME_STYLES;
    }
  }

  getWidgetFrameInlineStyles() {
    const stylesObject = this.getWidgetFrameStylesObject();

    if (!this.frame) {
      return inlineStyles(stylesObject);
    }

    const { clientHeight } = this.frame;

    Object.assign(stylesObject, {
      height: `${clientHeight}px`,
    });

    return inlineStyles(stylesObject);
  }
}

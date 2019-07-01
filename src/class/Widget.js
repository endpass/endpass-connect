import debounce from 'lodash.debounce';
import { METHODS, WIDGET_EVENTS } from '@/constants';
import { inlineStyles } from '@/util/dom';

const MOBILE_BREAKPOINT = 1024;
const FADE_TIMEOUT = 300;
const BASE_FRAME_HEIGHT = 80;
const BASE_FRAME_STYLES = {
  position: 'fixed',
  'z-index': 6000000,
  height: `${BASE_FRAME_HEIGHT}px`,
  border: 'none',
  'border-radius': '4px',
  transition: `opacity ${FADE_TIMEOUT}ms ease-in`,
};
const INITIAL_FRAME_STYLES = {
  ...BASE_FRAME_STYLES,
  opacity: 0,
};
const FRAME_DESKTOP_STYLES = {
  ...BASE_FRAME_STYLES,
  width: '260px',
  bottom: '5px',
  right: '15px',
};
const FRAME_MOBILE_STYLES = {
  ...BASE_FRAME_STYLES,
  right: '24px',
  bottom: '14px',
};
const FRAME_MOBILE_COLLAPSED_STYLES = {
  ...FRAME_MOBILE_STYLES,
  width: '64px',
};
const FRAME_MOBILE_EXPANDED_STYLES = {
  ...FRAME_MOBILE_STYLES,
  width: 'calc(100% - 24px * 2)',
};

export default class Widget {
  /**
   * @param {Context} options.context Context
   * @param {String} options.url Context
   */
  constructor({ context, url }) {
    this.context = context;
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
  }

  /* eslint-disable-next-line */
  get isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  subscribe() {
    const widgetMessenger = this.context.getWidgetMessenger();

    widgetMessenger.setTarget(this.frame.contentWindow);
    widgetMessenger.subscribe(METHODS.WIDGET_INIT, (payload, req) => {
      req.answer({
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
    const widgetMessenger = this.context.getWidgetMessenger();

    document.body.removeEventListener('click', this.handleDocumentClick);
    widgetMessenger.send(METHODS.WIDGET_COLLAPSE_RESPONSE);
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
      <iframe id="endpass-widget" data-endpass="widget-frame" style="${styles}" src="${url}"></iframe>
    `;

    document.body.insertAdjacentHTML('afterBegin', markup);

    this.frame = document.body.querySelector('[data-endpass="widget-frame"]');
    this.frame.addEventListener('load', this.handleWidgetFrameLoad);
    window.addEventListener('resize', this.debouncedHandleScreenResize);

    this.subscribe();

    return this.frame;
  }

  unmount() {
    const widgetMessenger = this.context.getWidgetMessenger();

    this.frame.style.opacity = 0;
    this.isLoaded = false;
    this.isMounted = false;

    widgetMessenger.unsubscribe(METHODS.WIDGET_INIT);
    widgetMessenger.unsubscribe(METHODS.WIDGET_EXPAND_REQUEST);
    widgetMessenger.unsubscribe(METHODS.WIDGET_OPEN);
    widgetMessenger.unsubscribe(METHODS.WIDGET_CLOSE);
    widgetMessenger.unsubscribe(METHODS.WIDGET_FIT);

    this.frame.removeEventListener('load', this.handleWidgetFrameLoad);
    window.removeEventListener('resize', this.debouncedHandleScreenResize);

    // Awaiting application animation ending
    setTimeout(() => {
      this.emitFrameEvent(WIDGET_EVENTS.DESTROY);
      this.frame.remove();
    }, FADE_TIMEOUT);
  }

  handleWidgetFrameLoad() {
    this.emitFrameEvent(WIDGET_EVENTS.MOUNT);
    this.isLoaded = true;
    this.frame.style = this.getWidgetFrameInlineStyles();
  }

  handleScreenResize() {
    const widgetMessenger = this.context.getWidgetMessenger();

    widgetMessenger.send(METHODS.WIDGET_CHANGE_MOBILE_MODE, {
      isMobile: this.isMobile,
    });
    this.frame.style = this.getWidgetFrameInlineStyles();
  }

  /**
   * @param {String} options.height Height in px or other CSS/HTML friendly unit
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
          ...(this.position || {}),
          ...FRAME_DESKTOP_STYLES,
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

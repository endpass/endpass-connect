import { METHODS, WIDGET_EVENTS } from '@/constants';
import { inlineStyles } from '@/util/dom';

const FADE_TIMEOUT = 300;
const getStylesByPosition = position => {
  return (
    position || {
      bottom: '15px',
      right: '15px',
    }
  );
};
const createWidgetIframeStyles = position => {
  return inlineStyles(
    Object.assign(
      {
        position: 'fixed',
        'z-index': 6000000,
        width: '240px',
        height: '70px',
        border: 'none',
        'border-radius': '4px',
        opacity: 0,
        transition: `opacity ${FADE_TIMEOUT}ms ease-in`,
      },
      getStylesByPosition(position),
    ),
  );
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
    this.isMounted = false;

    this.handleWidgetFrameLoad = this.handleWidgetFrameLoad.bind(this);
  }

  subscribe() {
    const widgetMessenger = this.context.getWidgetMessenger();

    widgetMessenger.setTarget(this.frame.contentWindow);

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

  /**
   * Create markup and prepend to <body>
   */
  mount(parameters = {}) {
    this.isMounted = true;

    const { url } = this;
    const styles = createWidgetIframeStyles(parameters.position);
    const markup = `
      <iframe id="endpass-widget" data-endpass="widget-frame" style="${styles}" src="${url}"></iframe>
    `;

    document.body.insertAdjacentHTML('afterBegin', markup);

    this.frame = document.body.querySelector('[data-endpass="widget-frame"]');
    this.frame.addEventListener('load', this.handleWidgetFrameLoad);

    this.subscribe();

    return this.frame;
  }

  unmount() {
    this.frame.style.opacity = 0;

    setTimeout(() => {
      this.emitFrameEvent(WIDGET_EVENTS.DESTROY);
      this.frame.removeEventListener('load', this.handleWidgetFrameLoad);
      this.frame.remove();
    }, FADE_TIMEOUT);

    this.isMounted = false;
  }

  getWidgetNode() {
    return new Promise(resolve => {
      /* eslint-disable-next-line */
      const handler = () =>
        setTimeout(() => {
          if (this.frame) {
            return resolve(this.frame);
          }

          handler();
        }, 250);

      handler();
    });
  }

  isWidgetMounted() {
    return this.isMounted;
  }

  handleWidgetFrameLoad() {
    this.emitFrameEvent(WIDGET_EVENTS.MOUNT);
    this.frame.style.opacity = 1;
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
   * @param {String} options.height Height in px or other CSS/HTML friendly unit
   */
  resize({ height }) {
    this.frame.style.height = height;
  }
}

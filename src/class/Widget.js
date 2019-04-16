import { inlineStyles } from '@/util/dom';

const getStylesByPosition = position => {
  switch (position) {
    case 'top left':
      return {
        top: '15px',
        left: '15px',
      };
    case 'top right':
      return {
        top: '15px',
        right: '15px',
      };
    case 'bottom left':
      return {
        bottom: '15px',
        left: '15px',
      };
    case 'bottom right':
    default:
      return {
        bottom: '15px',
        right: '15px',
      };
  }
};
const createWidgetIframeStyles = position => {
  return inlineStyles(
    Object.assign(
      {
        position: 'fixed',
        'z-index': 99999999999999,
        width: '240px',
        height: '70px',
        border: 'none',
        'border-radius': '4px',
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

    this.handleWidgetFrameLoad = this.handleWidgetFrameLoad.bind(this);
  }

  /**
   * Create markup and prepend to <body>
   */
  mount(parameters = {}) {
    const { url } = this;
    const widgetMessenger = this.context.getWidgetMessenger();
    const styles = createWidgetIframeStyles(parameters.position);
    const markup = `
      <iframe id="endpass-widget" data-endpass="widget-frame" style="${styles}" src="${url}"></iframe>
    `;

    document.body.insertAdjacentHTML('afterBegin', markup);

    this.frame = document.body.querySelector('[data-endpass="widget-frame"]');
    this.frame.addEventListener('load', this.handleWidgetFrameLoad);

    widgetMessenger.setTarget(this.frame.contentWindow);
  }

  unmount() {
    this.emitFrameEvent('destroy');
    this.frame.removeEventListener('load', this.handleWidgetFrameLoad);
    this.frame.remove();
  }

  handleWidgetFrameLoad() {
    this.emitFrameEvent('load');
  }

  emitFrameEvent(event, detail) {
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

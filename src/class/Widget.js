import { inlineStyles } from '@/util/dom';

const widgetIframeStyles = inlineStyles({
  position: 'fixed',
  bottom: '15px',
  right: '15px',
  'z-index': 99999999999999,
  width: '240px',
  height: '70px',
  border: 'none',
  'border-radius': '4px',
});

export default class Widget {
  /**
   * @param {Context} options.context Context
   * @param {String} options.url Context
   */
  constructor({ context, url }) {
    this.context = context;
    this.url = url;
    this.frame = null;
  }

  /**
   * Create markup and prepend to <body>
   */
  mount() {
    const { url } = this;
    const widgetMessenger = this.context.getWidgetMessenger();
    const markup = `
      <iframe data-endpass="widget-frame" style="${widgetIframeStyles}" src="${url}"></iframe>
    `;

    document.body.insertAdjacentHTML('afterBegin', markup);

    this.frame = document.body.querySelector('[data-endpass="widget-frame"]');

    widgetMessenger.setTarget(this.frame.contentWindow);
  }

  /**
   * @param {String} options.height Height in px or other CSS/HTML friendly unit
   */
  resize({ height }) {
    this.frame.style.height = height;
  }
}

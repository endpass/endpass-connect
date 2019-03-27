import { inlineStyles, inlineStylesState } from '@/util/dom';
import { METHODS } from '@/constants';

const propsWrapper = {
  'min-width': '320px',
  'max-width': '360px',
  margin: '50px auto',
};
const stylesWrapperShow = inlineStyles({
  ...propsWrapper,
  transition: 'opacity 0.35s ease-in-out',
  opacity: 1,
});

const stylesWrapperHide = inlineStyles({
  ...propsWrapper,
  opacity: 0,
});

const stylesOverlayShow = inlineStyles({
  position: 'fixed',
  top: '0',
  left: '0',
  'z-index': '6000000',
  width: '100vw',
  height: '100vh',
  'overflow-y': 'auto',
  'background-color': 'rgba(0, 0, 0, 0.6)',
  opacity: 1,
});

const stylesOverlayHide = inlineStyles({
  position: 'absolute',
  top: '-999px',
  left: '-999px',
  width: '0',
  height: '0',
  opacity: 0,
});

const propsIframe = {
  width: '100%',
  height: '100%',
  'box-shadow': '0 5px 10px 1px rgba(0, 0, 0, 0.15)',
  'border-radius': '4px',
  border: 'none',
};

const propsIframeHide = {
  opacity: 0.001,
};

const propsIframeShow = {
  opacity: 1,
};

export default class Dialog {
  /**
   * @param {Context} options.context Context
   * @param {String} options.url Context
   */
  constructor({ context, url }) {
    this.context = context;
    this.url = url;

    // Dialog elements nodes
    this.overlay = null;
    this.wrapper = null;
    this.frame = null;
    this.isShown = false;
    this.frameStyles = inlineStylesState(propsIframe);

    this.mount();
  }

  /**
   * Create markup and prepend to <body>
   */
  mount() {
    const nameSpace = this.context.getNamespace();
    const NSmarkup = nameSpace ? `data-endpass-namespace="${nameSpace}"` : '';

    const markup = `
      <div data-endpass="overlay" ${NSmarkup} style="${stylesOverlayHide}" >
        <div data-endpass="wrapper" style="${stylesWrapperHide}">
          <iframe data-endpass="frame" src="${
            this.url
          }" style="${this.frameStyles(propsIframeHide)}"/>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('afterBegin', markup);

    this.overlay = document.body.querySelector('[data-endpass="overlay"]');
    this.wrapper = document.body.querySelector('[data-endpass="wrapper"]');
    this.frame = document.body.querySelector('[data-endpass="frame"]');

    const messenger = this.context.getMessenger();

    messenger.setTarget(this.frame.contentWindow);

    messenger.subscribe(METHODS.DIALOG_RESIZE, ({ offsetHeight }) => {
      this.frame.style = this.frameStyles({
        'min-height': `${offsetHeight || 0}px`,
      });
    });

    messenger.subscribe(METHODS.DIALOG_CLOSE, () => {
      this.isShown = false;
      this.overlay.style = stylesOverlayHide;
      this.frame.style = this.frameStyles(propsIframeHide);
      this.wrapper.style = stylesWrapperHide;
    });

    messenger.subscribe(METHODS.DIALOG_OPEN, () => {
      this.isShown = true;
      this.frame.style = this.frameStyles(propsIframeShow);
      this.overlay.style = stylesOverlayShow;
      this.wrapper.style = stylesWrapperShow;
    });
  }
}

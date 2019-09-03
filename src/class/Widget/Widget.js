import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import debounce from 'lodash.debounce';
import { DIRECTION, METHODS, WIDGET_EVENTS } from '@/constants';
import { inlineStyles } from '@/util/dom';
import {
  MOBILE_BREAKPOINT,
  FADE_TIMEOUT,
  getWidgetFrameStylesObject,
} from './WidgetStyles';
import StateExpand from './states/StateExpand';
import StateCollapse from './states/StateCollapse';
import StateOpen from './states/StateOpen';
import StateClose from './states/StateClose';

export default class Widget {
  /**
   * @param {object} props
   * @param {object} props.namespace namespace
   * @param {import('@/class/MessengerGroup')} props.messengerGroup messengerGroup for communicate between others
   * @param {string} props.url frame url
   * @param {object} props.initialPayload initial payload
   */
  constructor({
    namespace = '',
    messengerGroup,
    initialPayload,
    url,
    elementsSubscriber,
  }) {
    this.messengerGroup = messengerGroup;
    this.url = url;
    this.initialPayload = initialPayload;
    this.elementsSubscriber = elementsSubscriber;
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

    this.widgetMessenger = new CrossWindowMessenger({
      showLogs: !ENV.isProduction,
      name: `connect-bridge-widget[${namespace}]`,
      to: DIRECTION.AUTH,
      from: DIRECTION.CONNECT,
    });
    /** @type Array<Promise> */
    this.frameResolver = [];
    this.subscribe();
  }

  /* eslint-disable-next-line */
  get isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  subscribe() {
    const { widgetMessenger } = this;

    widgetMessenger.subscribe(METHODS.INITIATE, (payload, req) => {
      req.answer({
        ...this.initialPayload,
        source: DIRECTION.WIDGET,
      });
    });

    widgetMessenger.subscribe(METHODS.WIDGET_INIT, (payload, req) => {
      req.answer({
        position: this.position,
        isMobile: this.isMobile,
      });
    });

    widgetMessenger.subscribe(METHODS.WIDGET_EXPAND_REQUEST, (payload, req) => {
      this.stateCompact.onExpand();
      this.stateCompact = new StateExpand(this);
      req.answer();
    });
    widgetMessenger.subscribe(METHODS.WIDGET_COLLAPSE_REQUEST, () => {
      this.stateCompact.onCollapse();
      this.stateCompact = new StateCollapse(this);
    });

    widgetMessenger.subscribe(METHODS.WIDGET_OPEN, ({ root }, req) => {
      this.state.onOpen(root);
      this.state = new StateOpen(this);
      req.answer();
    });
    widgetMessenger.subscribe(METHODS.WIDGET_CLOSE, () => {
      this.state.onClose();
      this.state = new StateClose(this);
    });
    widgetMessenger.subscribe(METHODS.WIDGET_FIT, ({ height }) => {
      this.resize({ height: `${height}px` });
    });
    widgetMessenger.subscribe(METHODS.WIDGET_UNMOUNT, () => {
      this.unmount();
    });

    widgetMessenger.subscribe(METHODS.LOGOUT_REQUEST, (payload, req) => {
      this.elementsSubscriber.handleLogoutMessage(DIRECTION.WIDGET, req);
    });
    widgetMessenger.subscribe(
      METHODS.CHANGE_SETTINGS_REQUEST,
      (payload, req) => {
        this.elementsSubscriber.handleSettingsChange(payload, req);
      },
    );
    widgetMessenger.subscribe(METHODS.WIDGET_GET_SETTING, (payload, req) => {
      this.elementsSubscriber.handleGetSettings(payload, req);
    });

    this.elementsSubscriber.emitter.on('logout', () => {
      this.emitFrameEvent(this.frame, WIDGET_EVENTS.LOGOUT);
    });
    this.elementsSubscriber.emitter.on('set-provider-settings', payload => {
      this.emitFrameEvent(this.frame, WIDGET_EVENTS.UPDATE, payload);
    });
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
    this.widgetMessenger.send(METHODS.WIDGET_COLLAPSE_RESPONSE);
  }

  handleDocumentClickOnce() {
    document.body.addEventListener('click', this.handleDocumentClick);
  }

  /**
   *
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

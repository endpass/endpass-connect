import ConnectError from '@endpass/class/ConnectError';
import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import { DIRECTION, PLUGIN_NAMES, PLUGIN_METHODS } from '@/constants';
import StateClose from './states/StateClose';
import dialogHandlers from '@/plugins/DialogPlugin/dialogHandlers';
import PluginBase from '@/plugins/PluginBase';
import { getFrameRouteUrl } from '@/util/url';
import DialogView from '@/class/Dialog/View';

const { ERRORS } = ConnectError;

const INITIAL_TIMEOUT = 5 * 1000; // 5 seconds

/**
 * @callback Listener {import('@types/global').Listener}
 */

/**
 * @typedef {Object<string, Array<Listener>>} Resolvers
 */

export default class DialogPlugin extends PluginBase {
  static get pluginName() {
    return PLUGIN_NAMES.DIALOG;
  }

  static get handlers() {
    return dialogHandlers;
  }

  /**
   * @param {object} options
   * @param {object} context
   * @param {string} options.url frame url
   * @param {string?} options.namespace namespace of connect
   * @param {HTMLElement|string?} [options.element] render place
   */
  constructor(options, context) {
    super(options, context);
    const { namespace = '', authUrl, element } = options;

    this.namespace = namespace;
    this.url = getFrameRouteUrl(authUrl, 'bridge');
    this.ready = false;
    this.element = element;
    this.isElementMode = !!element;
    this.state = new StateClose(this);

    /** @type Resolvers */
    this.readyResolvers = [];
    this.initialTimer = null;
    this.dialog = new DialogView({
      url: this.url,
      namespace: this.namespace,
      element: this.element,
    });
  }

  init() {
    this.context.executeMethod(PLUGIN_METHODS.CONTEXT_MOUNT_DIALOG);
  }

  get messenger() {
    if (!this.dialogMessenger) {
      this.dialogMessenger = new CrossWindowMessenger({
        showLogs: !ENV.isProduction,
        name: `connect-bridge-dialog[]`,
        to: DIRECTION.AUTH,
        from: DIRECTION.CONNECT,
      });
    }
    return this.dialogMessenger;
  }

  onClose() {
    this.dialog.hide();
  }

  onOpen() {
    this.dialog.show();
  }

  /**
   * @private
   * @param {string} event
   */
  emitEvent(event) {
    this.dialog.emitEvent(event);
  }

  /**
   * Checks dialog ready state
   * Ask messenger before til it give any answer and resolve promise
   * Also, it is caches ready state and in the next time just resolve returned
   * promise
   * @private
   * @returns {Promise<boolean>}
   */
  checkReadyState() {
    /* eslint-disable-next-line */
    return new Promise(async resolve => {
      if (this.ready) {
        return resolve(true);
      }

      this.readyResolvers.push(resolve);
    });
  }

  /**
   * Create markup and prepend to <body>
   * @private
   */
  mount() {
    this.dialog.mount();
    this.dialogMessenger.setTarget(this.dialog.target);
    this.dialog.onFrameLoad(() => {
      this.initialTimer = setTimeout(() => {
        // eslint-disable-next-line no-console
        console.error(
          `Dialog is not initialized, please check auth url ${this.url}`,
        );
      }, INITIAL_TIMEOUT);
    });
  }

  /**
   * @private
   * @return {HTMLElement}
   */
  selectHTMLElement() {
    return this.dialog.rootElement;
  }

  /**
   * Wrapper on sendMessage and awaitMessage methods
   * Send message with given payload and awaits answer on it
   * @public
   * @param {string} method Method name
   * @param {object} [payload] Message payload. Must includes method property
   * @returns {Promise<any>} Responded message payload
   */
  async ask(method, payload) {
    if (!method) {
      throw ConnectError.create(ERRORS.BRIDGE_PROVIDE_METHOD);
    }

    await this.checkReadyState();
    const res = await this.dialogMessenger.sendAndWaitResponse(method, payload);

    return res;
  }
}

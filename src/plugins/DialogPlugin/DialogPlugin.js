// @ts-check
import ConnectError from '@endpass/class/ConnectError';
import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import { DIRECTION, PLUGIN_NAMES, PLUGIN_METHODS } from '@/constants';
import StateOpen from './states/StateOpen';
import StateClose from './states/StateClose';
import dialogHandlers from '@/plugins/DialogPlugin/dialogHandlers';
import PluginBase from '@/plugins/PluginBase';
import { getFrameRouteUrl } from '@/util/url';
import DialogView from '@/class/DialogView';

const { ERRORS } = ConnectError;

export default class DialogPlugin extends PluginBase {
  static get pluginName() {
    return PLUGIN_NAMES.DIALOG;
  }

  static get handlers() {
    return dialogHandlers;
  }

  /**
   * @param {import('@/class/Context').default} context
   * @param {object} options
   * @param {string} options.authUrl frame url
   * @param {string=} options.namespace namespace of connect
   * @param {HTMLElement|string=} options.element render place
   */
  constructor(options, context) {
    super(options, context);
    const { namespace = '', authUrl, element } = options;

    this.namespace = namespace;
    this.url = getFrameRouteUrl(authUrl, 'bridge');

    this.dialogView = new DialogView({
      url: this.url,
      namespace: this.namespace,
      element,
    });

    this.state = new StateClose(this.dialogView);
  }

  init() {
    this.context.executeMethod(PLUGIN_METHODS.CONTEXT_MOUNT_DIALOG);
  }

  /**
   * @return {CrossWindowMessenger}
   */
  get messenger() {
    if (!this.dialogMessenger) {
      this.dialogMessenger = new CrossWindowMessenger({
        // showLogs: !ENV.isProduction,
        name: `connect-dialog[]`,
        to: DIRECTION.AUTH,
        from: DIRECTION.CONNECT,
      });
    }
    return this.dialogMessenger;
  }

  /**
   * Create markup and prepend to <body>
   * @private
   */
  mount() {
    this.dialogView.mount();
    const { target } = this.dialogView;
    if (target) {
      this.messenger.setTarget(target);
    }
  }

  /**
   *
   * @param {object} payload
   */
  resize(payload) {
    this.dialogView.resize(payload);
  }

  handleReady() {
    this.dialogView.handleReady();
  }

  close() {
    this.state.close();
    this.state = new StateClose(this.dialogView);
  }

  open() {
    this.state.open();
    this.state = new StateOpen(this.dialogView);
  }

  /**
   * Wrapper on sendMessage and awaitMessage methods
   * Send message with given payload and awaits answer on it
   * @public
   * @param {string} method Method name
   * @param {object} [payload] Message payload. Must includes method property
   * @returns {Promise<object>} Responded message payload
   */
  async ask(method, payload) {
    if (!method) {
      throw ConnectError.create(ERRORS.BRIDGE_PROVIDE_METHOD);
    }

    await this.dialogView.waitReady();
    const res = await this.messenger.sendAndWaitResponse(method, payload);

    return res;
  }
}

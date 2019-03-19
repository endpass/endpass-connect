import { METHODS } from '@/constants';
import Dialog from './Dialog';

/**
 * @callback Listener {import('@types/global').Listener}
 */

/**
 * @typedef {Object<string, Array<Listener>>} Resolvers
 */

export default class Bridge {
  /**
   * @param InstanceType<{import('@Context')} options.context Context link
   * @param {String} options.url Url for open dialog
   * @param {any} options.initialPayload initial data for Auth
   */
  constructor({ context, url, initialPayload }) {
    this.context = context;
    this.initialPayload = initialPayload;
    this.dialog = new Dialog({ context, url });
    this.ready = false;

    /** @type Resolvers */
    this.readyResolvers = [];

    this.context.getMessenger().subscribe(METHODS.INITIATE, (payload, req) => {
      req.answer(this.initialPayload);
    });

    this.context.getMessenger().subscribe(METHODS.READY_STATE_BRIDGE, () => {
      this.ready = true;
      this.readyResolvers.forEach(item => item(true));
      this.readyResolvers.length = 0;
    });
  }

  /**
   * Checks bridge ready state
   * Ask messenger before til it give any answer and resolve promise
   * Also, it is caches ready state and in the next time just resolve returned
   * promise
   * @returns {Promise<Boolean>}
   */
  checkReadyState() {
    return new Promise(async resolve => {
      if (this.ready) {
        return resolve(true);
      }

      this.readyResolvers.push(resolve);
    });
  }

  /**
   *
   * @param {{}} params for dialog
   * @return {Promise<void>}
   */
  async openDialog(params) {
    await this.checkReadyState();

    await this.dialog.open(params);
  }

  /**
   * Close dialog
   */
  closeDialog() {
    this.dialog.close();
  }

  /**
   * Wrapper on sendMessage and awaitMessage methods
   * Send message with given payload and awaits answer on it
   * @param {String} method Method name
   * @param {Object} payload Message payload. Must includes method property
   * @returns {Promise<any>} Responded message payload
   */
  async ask(method, payload) {
    if (!method) {
      throw new Error('You should provide method into you question to bridge!');
    }

    await this.checkReadyState();

    const res = await this.context
      .getMessenger()
      .sendAndWaitResponse(method, payload);

    return res;
  }
}

// @ts-check
import PluginBase from '@/plugins/PluginBase';
import { PLUGIN_NAMES } from '@/constants';

/**
 * @callback Listener {import('@types/global').Listener}
 */

/**
 * @typedef {Object<string, Array<Listener>>} Resolvers
 */

/**
 * @typedef {import('@endpass/class/CrossWindowMessenger').default} CrossWindowMessenger
 */

export default class BroadcastPlugin extends PluginBase {
  static get pluginName() {
    return PLUGIN_NAMES.BROADCAST;
  }

  /**
   *
   * @param {object} options
   * @param {import('@/class/Context').default} context
   */
  constructor(options, context) {
    super(options, context);
    /** @type Array<CrossWindowMessenger> */
    this.messengers = [];
  }

  /**
   * @param {CrossWindowMessenger} messenger
   */
  addMessenger(messenger) {
    if (this.messengers.includes(messenger)) {
      return;
    }
    this.messengers.push(messenger);
  }

  /**
   * @param {CrossWindowMessenger} messenger
   */
  removeMessenger(messenger) {
    this.messengers = this.messengers.filter(item => item !== messenger);
  }

  /**
   *
   * @param {string} msg
   * @param {any} payload
   */
  send(msg, payload) {
    this.messengers.forEach(messenger => {
      messenger.send(msg, payload);
    });
  }
}

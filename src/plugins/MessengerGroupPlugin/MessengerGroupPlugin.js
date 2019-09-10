// @ts-check

// @ts-ignore
// eslint-disable-next-line no-unused-vars
import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import PluginFactory from '@/class/PluginFactory';
import PluginBase from '@/plugins/PluginBase';
import { PLUGIN_NAMES } from '@/constants';

/**
 * @callback Listener {import('@types/global').Listener}
 */

/**
 * @typedef {Object<string, Array<Listener>>} Resolvers
 */

class MessengerGroupPlugin extends PluginBase {
  static get pluginName() {
    return PLUGIN_NAMES.MESSENGER_GROUP;
  }

  /**
   *
   * @param {object} options
   * @param {object} context
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

export default PluginFactory.create(MessengerGroupPlugin);

// @ts-check

// @ts-ignore
// eslint-disable-next-line no-unused-vars
import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';

/**
 * @callback Listener {import('@types/global').Listener}
 */

/**
 * @typedef {Object<string, Array<Listener>>} Resolvers
 */

export default class MessengerGroup {
  constructor() {
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

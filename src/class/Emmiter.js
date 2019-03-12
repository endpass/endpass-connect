// @ts-check
/**
 * @callback Listener:(...args: any) => void
 */

/**
 * @typedef {Object<string, Array<Listener>>} Events
 */

export default class Emitter {
  constructor() {
    /** @type Events */
    this.events = {};
  }

  /**
   * @param {String} event - event name
   * @param {Listener} listener - callback
   */
  on(event, listener) {
    if (!Array.isArray(this.events[event])) {
      this.events[event] = [];
    }

    this.events[event].push(listener);

    return () => this.off(event, listener);
  }

  /**
   * @param {string} event - event name
   * @param {Listener} listener - callback
   */
  off(event, listener) {
    if (Array.isArray(this.events[event])) {
      const idx = this.events[event].indexOf(listener);
      if (idx > -1) {
        this.events[event].splice(idx, 1);
      }
    }
  }

  /**
   * @param {string} event - event name
   * @param {any} args - arguments
   */
  emit(event, ...args) {
    if (Array.isArray(this.events[event])) {
      this.events[event].forEach(listener => listener.apply(this, args));
    }
  }

  /**
   * @param {string} event - event name
   * @param {Listener} listener - callback
   */
  once(event, listener) {
    const remove = this.on(event, (...args) => {
      remove();
      listener.apply(this, args);
    });
  }
}

// @flow
export default class Emitter {
  events: Object;

  constructor() {
    this.events = {};
  }

  on(event: string, listener: () => mixed) {
    if (typeof this.events[event] !== 'object') {
      this.events[event] = [];
    }

    this.events[event].push(listener);

    return () => this.off(event, listener);
  }

  off(event: string, listener: () => mixed) {
    if (typeof this.events[event] === 'object') {
      const idx = this.events[event].indexOf(listener);
      if (idx > -1) {
        this.events[event].splice(idx, 1);
      }
    }
  }

  emit(event: string, ...args: Array<mixed>) {
    if (typeof this.events[event] === 'object') {
      this.events[event].forEach(listener => listener.apply(this, args));
    }
  }

  once(event: string, listener: () => mixed) {
    const remove = this.on(event, (...args) => {
      remove();
      listener.apply(this, args);
    });
  }
}

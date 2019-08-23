export default class Plugin {
  constructor({ context }) {
    this.context = context;
  }

  static getName() {
    throw new Error('Please define plugin name');
  }

  // eslint-disable-next-line class-methods-use-this
  init() {}
}

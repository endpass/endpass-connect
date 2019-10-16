export default class BaseWindow {
  constructor({ url }) {
    this.url = url;
  }

  async mount() {}

  show() {}

  close() {}

  target() {}

  resize() {}

  ready() {}
}

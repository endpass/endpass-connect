// @ts-check
export default class BaseWindow {
  prepare() {}

  /**
   * @param {string} url
   */
  mount(url) {}

  async waitReady() {}

  open() {}

  destroy() {}

  /**
   * @type {Window|null}
   */
  get target() {
    return null;
  }

  /**
   * @param {{offsetHeight:number}} payload
   */
  resize(payload) {}

  handleReady() {}

  connectionOpen() {}

  connectionError() {}
}

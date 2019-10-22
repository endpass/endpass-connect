// @ts-check
export default class BaseWindow {
  /**
   * @param {string} url
   */
  init(url) {}

  prepare() {}

  mount() {}

  async waitReady() {}

  open() {}

  close() {}

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
}

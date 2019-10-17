// @ts-check
export default class BaseWindow {
  /**
   * @param {object} props
   * @param {string=} props.url
   */
  constructor({ url } = {}) {
    this.url = url;
  }

  mount() {}

  async waitReady() {}

  open() {}

  close() {}

  /**
   * @type {Window|null|undefined}
   */
  get target() {
    return null;
  }

  /**
   * @param {object} payload
   */
  resize(payload) {}

  handleReady() {}
}

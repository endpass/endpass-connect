/* eslint-disable class-methods-use-this */
// @ts-check
// eslint-disable-next-line no-unused-vars

export default class State {
  /**
   *
   * @param {import('./Dialog')} dialog Request parameters object
   */
  constructor(dialog) {
    this.dialog = dialog;
  }

  onOpen() {}

  onClose() {}
}

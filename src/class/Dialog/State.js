// @ts-check

export default class State {
  /**
   *
   * @param {import('./Dialog')} dialog Dialog instance
   */
  constructor(dialog) {
    this.dialog = dialog;
  }

  onOpen() {}

  onClose() {}
}

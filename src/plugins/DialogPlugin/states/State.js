// @ts-check

export default class State {
  /**
   *
   * @param {import('../DialogPlugin')} dialog DialogPlugin instance
   */
  constructor(dialog) {
    this.dialog = dialog;
  }

  onOpen() {}

  onClose() {}
}

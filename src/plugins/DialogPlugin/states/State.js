// @ts-check

export default class State {
  /**
   *
   * @param {InstanceType<typeof import('../DialogPlugin').default>} dialog DialogPlugin instance
   */
  constructor(dialog) {
    this.dialog = dialog;
  }

  onOpen() {}

  onClose() {}
}

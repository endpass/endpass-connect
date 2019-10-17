// @ts-check

export default class State {
  /**
   *
   * @param {import('../DialogPlugin').default} dialogPlugin instance
   */
  constructor(dialogPlugin) {
    this.dialogPlugin = dialogPlugin;
  }

  open() {}

  close() {}
}

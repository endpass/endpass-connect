// @ts-check

export default class State {
  /**
   *
   * @param {import('../Widget')} widget Widget instance
   */
  constructor(widget) {
    this.widget = widget;
  }

  onExpand() {}

  onCollapse() {}

  onClose() {}

  onOpen() {}
}

// @ts-check

export default class State {
  /**
   *
   * @param {import('../WidgetPlugin')} widget Widget instance
   */
  constructor(widget) {
    this.widget = widget;
  }

  onExpand() {}

  onCollapse() {}

  onClose() {}

  onOpen() {}
}

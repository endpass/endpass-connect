/* eslint-disable class-methods-use-this */
// @ts-check
// eslint-disable-next-line no-unused-vars
import Widget from './Widget';

export default class State {
  /**
   *
   * @param {Widget} widget
   */
  constructor(widget) {
    this.widget = widget;
  }

  onExpand() {}

  onCollapse() {}

  onClose() {}

  onOpen() {}
}

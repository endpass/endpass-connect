import HandlersFactory from '@/class/HandlersFactory';

export default class PluginBase {
  /**
   * @return {string}
   */
  static get pluginName() {
    throw new Error('Please define plugin name');
  }

  /**
   *
   * @return {array}
   */
  static get dependencyPlugins() {
    return [];
  }

  static get lastPlugins() {
    return [];
  }

  /**
   *
   * @return {object}
   */
  static get handlers() {
    return {};
  }

  /**
   *
   * @param {object} options
   * @param {object} context
   */
  constructor(options, context) {
    this.context = context;
    this.handleEvent = HandlersFactory.createHandleEvent(
      this,
      this.constructor.handlers,
    );

    if (this.messenger) {
      this.messenger.subscribe((payload, req) => {
        context.handleEvent(payload, req);
      });
    }
  }

  handleEvent() {}

  /**
   *
   * @return {null|object}
   */
  get messenger() {
    return null;
  }
}

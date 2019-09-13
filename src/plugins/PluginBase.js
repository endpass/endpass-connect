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

  /**
   *
   * @return {object}
   */
  static get handlers() {
    return {};
  }

  static get publicApi() {
    return {};
  }

  /**
   *
   * @param {object} options
   * @param {object} context
   */
  constructor(options, context) {
    this.context = context;
    this.options = options;

    this.handlersMap = HandlersFactory.createHandlers(
      this,
      this.constructor.handlers,
    );

    if (this.messenger) {
      this.messenger.subscribe((payload, req) => {
        context.handleEvent(payload, req);
      });
    }
  }

  init() {}

  handleEvent(payload, req) {
    if (!this.handlersMap[req.method]) {
      return null;
    }
    return this.handlersMap[req.method](payload, req);
  }

  /**
   *
   * @return {null|object}
   */
  get messenger() {
    return null;
  }
}

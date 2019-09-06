import HandlersFactory from '@/class/HandlersFactory';

export default class PluginBase {
  static get pluginName() {
    throw new Error('Please define plugin name');
  }

  static get dependencyPlugins() {
    return [];
  }

  static get handlers() {
    return {};
  }

  constructor(props, context) {
    this.context = context;
    this.handleEvent = HandlersFactory.createHandleEvent(
      this,
      this.constructor.handlers,
    );
  }

  handleEvent() {}

  get subscribeData() {
    return [];
  }
}

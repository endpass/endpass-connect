import Context from '@/class/Context';

export default class PluginBase {
  constructor(options, context) {
    // connect mode
    if (context) {
      this.context = context;
      return;
    }

    // singleton mode
    this.context = new Context(
      {
        ...options,
        plugins: this.constructor.dependencyPlugins,
      },
      this,
    );
  }

  static get pluginName() {
    throw new Error('Please define plugin name');
  }

  static get dependencyPlugins() {
    return [];
  }

  handleEvent() {}

  get subscribeData() {
    return [];
  }
}

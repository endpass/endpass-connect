//import Context from '@/Context';

export default class PluginBase {
  constructor(options) {
    const { context } = options;
    // if (!context) {
    //   context = new Context(options);
    // }
    this.context = context;
  }

  static get pluginName() {
    throw new Error('Please define plugin name');
  }

  handleEvent() {}

  get subscribeData() {
    return [];
  }
}

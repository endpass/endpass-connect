export default class Plugin {
  constructor(context) {
    this.context = context;
  }

  static pluginName() {
    return 'PluginName';
  }

  init() {}
}

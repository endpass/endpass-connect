export default class Plugin {
  constructor(context) {
    this.context = context;
  }

  static pluginName() {
    return 'PleaseDefinePluginNameHere';
  }

  // eslint-disable-next-line class-methods-use-this
  init() {}
}

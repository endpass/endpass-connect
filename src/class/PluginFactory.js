import PluginApiTrait from '@/class/PluginApiTrait';

export default class PluginFactory {
  static create(ClassPlugin) {
    function Plugin(options) {
      return new PluginApiTrait(options, ClassPlugin);
    }

    Plugin.ClassPlugin = ClassPlugin;

    return Plugin;
  }
}

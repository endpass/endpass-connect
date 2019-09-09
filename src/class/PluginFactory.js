import PluginApiTrait from '@/class/PluginApiTrait';

export default class PluginFactory {
  static create(ClassPlugin) {
    function Plugin(options, context) {
      // single mode
      if (!context) {
        return new PluginApiTrait(options, Plugin);
      }

      // plugin mode
      return new ClassPlugin(options, context);
    }

    Plugin.dependencyPlugins = ClassPlugin.dependencyPlugins;
    Plugin.pluginName = ClassPlugin.pluginName;

    return Plugin;
  }
}

import PluginContainerApi from '@/class/PluginContainerApi';

export default class PluginFactory {
  static create(ClassPlugin) {
    function Plugin(options, context) {
      // single mode
      if (!context) {
        return new PluginContainerApi({
          ...options,
          plugins: ClassPlugin.dependencyPlugins,
          singlePlugin: ClassPlugin.pluginName,
        });
      }

      // plugin mode
      return new ClassPlugin(options, context);
    }

    Plugin.dependencyPlugins = ClassPlugin.dependencyPlugins;
    Plugin.pluginName = ClassPlugin.pluginName;

    return Plugin;
  }
}

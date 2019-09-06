import PluginContainerApi from '@/class/PluginContainerApi';

export default class PluginFactory {
  static create(ClassPlugin) {
    function Plugin(options, context) {
      // single mode
      if (!context) {
        return new PluginContainerApi(options, Plugin);
      }

      // plugin mode
      return new ClassPlugin(options, context);
    }

    Plugin.dependencyPlugins = ClassPlugin.dependencyPlugins;
    Plugin.pluginName = ClassPlugin.pluginName;

    return Plugin;
  }

  static createUniqueClasses(pluginsClasses, objectMap = {}) {
    return pluginsClasses.reduce((map, PluginClass) => {
      if (map[PluginClass.pluginName]) {
        return map;
      }

      Object.assign(map, {
        [PluginClass.pluginName]: PluginClass,
      });

      const childMap = PluginFactory.createUniqueClasses(
        PluginClass.dependencyPlugins,
        map,
      );

      return Object.assign(map, {
        ...childMap,
      });
    }, objectMap);
  }

  static createProxy(targetMap) {
    return new Proxy(targetMap, {
      get(target, name) {
        if (!(name in target)) {
          debugger;
          throw new Error(`Please define '${name}' plugin`);
        }
        return target[name];
      },
      set(target, name, value) {
        if (name in target) {
          throw new Error(`Plugin '${name}' already defined`);
        }
        Object.assign(target, {
          [name]: value,
        });
        return true;
      },
    });
  }
}

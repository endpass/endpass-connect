export default class ClassesFactory {
  static createUniqueClasses(pluginsClasses, objectMap = {}) {
    return pluginsClasses.reduce((map, PluginClass) => {
      if (map[PluginClass.pluginName]) {
        return map;
      }

      Object.assign(map, {
        [PluginClass.pluginName]: PluginClass,
      });

      const childMap = ClassesFactory.createUniqueClasses(
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

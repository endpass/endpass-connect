import mapValues from 'lodash.mapvalues';

export default class ComponentsFactory {
  /**
   *
   * @param {Array<typeof Plugin>} pluginClassesList
   * @param {object} props
   * @param {*} props.options
   * @param {import('./context')} props.context
   * @return {*}
   */
  static createComponents(pluginClassesList, props) {
    const { options = {}, context } = props;

    const pluginClassesMap = ComponentsFactory.createUniqueClasses(
      pluginClassesList,
    );

    const targetMap = mapValues(pluginClassesMap, PluginClass => {
      return new PluginClass(options, context);
    });

    return ComponentsFactory.createProxy(targetMap);
  }

  static createUniqueClasses(pluginsClasses, objectMap = {}) {
    return pluginsClasses.reduce((map, PluginClass) => {
      if (map[PluginClass.pluginName]) {
        return map;
      }

      Object.assign(map, {
        [PluginClass.pluginName]: PluginClass,
      });

      const childMap = ComponentsFactory.createUniqueClasses(
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

export default class PluginManager {
  /**
   *
   * @param {Array<typeof Plugin>} pluginClassesList
   * @param {object} props
   * @param {*} props.options
   * @param {import('./context')} props.context
   * @return {*}
   */
  static createPlugins(pluginClassesList, props) {
    const targetMap = pluginClassesList.reduce((pluginsMap, PluginClass) => {
      const { pluginName } = PluginClass;
      if (pluginsMap[pluginName]) {
        throw new Error(`plugin '${pluginName}' already defined`);
      }

      return Object.assign(pluginsMap, {
        [pluginName]: new PluginClass(props),
      });
    }, {});

    const res = new Proxy(targetMap, {
      get(target, name) {
        if (!(name in target)) {
          throw new Error(`Please define '${name}' plugin`);
        }
        return target[name];
      },
    });

    return res;
  }
}

const availablePlugins = {
  provider: true,
  oauth: true,
  basicModules: true,
};

export default class PluginManager {
  static createPlugins(context, plugins, options) {
    const pluginForCreateMap = plugins.reduce((map, Plugin) => {
      // eslint-disable-next-line no-param-reassign
      map[Plugin.pluginName()] = Plugin;
      return map;
    }, {});

    const setHandler = () => {
      throw new Error(`Please do not call setter for '${pluginName}' plugin`);
    };

    // create all plugins
    const pluginsInstances = Object.keys(availablePlugins).reduce(
      (map, pluginName) => {
        if (!availablePlugins[pluginName]) {
          return map;
        }
        const Plugin = pluginForCreateMap[pluginName];

        if (!Plugin) {
          Object.defineProperty(map, pluginName, {
            get() {
              throw new Error(`Please define '${pluginName}' plugin`);
            },
            set: setHandler,
          });
          return map;
        }

        Object.assign(map, {
          [pluginName]: new Plugin(context, options),
        });
        return map;
      },
      {},
    );

    return pluginsInstances;
  }

  static init(plugins) {
    // eslint-disable-next-line
    for (const key in plugins) {
      plugins[key].init();
    }
  }
}

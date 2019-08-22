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

        const instance = Plugin ? new Plugin(context, options) : null;

        const getHandler = Plugin
          ? () => instance
          : () => {
              throw new Error(`Please define '${pluginName}' plugin`);
            };

        Object.defineProperty(map, pluginName, {
          get: getHandler,
          set: setHandler,
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

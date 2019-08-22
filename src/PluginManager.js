const AVAILABLE_PLUGINS = {
  provider: true,
  auth: true,
  oauth: true,
  elements: true,
};

export default class PluginManager {
  static createPlugins(context, plugins, options) {
    const pluginForCreateMap = plugins.reduce((map, Plugin) => {
      // eslint-disable-next-line no-param-reassign
      const pluginName = Plugin.pluginName();
      if (map[pluginName]) {
        throw new Error(`plugin '${pluginName}' already defined`);
      }
      map[pluginName] = Plugin;
      return map;
    }, {});

    const setHandler = () => {
      throw new Error(`Please do not call setter for '${pluginName}' plugin`);
    };

    // create all plugins
    const pluginsInstances = Object.keys(AVAILABLE_PLUGINS).reduce(
      (map, pluginName) => {
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

const availablePlugins = ['provider', 'oauth', 'basicModules'];

export default class PluginManager {
  constructor(context, plugins, options) {
    const usePlugins = plugins.reduce((map, Plugin) => {
      // eslint-disable-next-line no-param-reassign
      map[Plugin.pluginName()] = Plugin;
      return map;
    }, {});

    // create all plugins
    availablePlugins.forEach(pluginName => {
      const Plugin = usePlugins[pluginName];

      const instance = Plugin ? new Plugin(context, options) : null;

      const handler = Plugin
        ? () => instance
        : () => {
            throw new Error(`Please define '${pluginName}' plugin`);
          };

      Object.defineProperty(this, pluginName, {
        get: handler,
      });
    });

    this.usePlugins = usePlugins;
  }

  init() {
    availablePlugins.forEach(pluginName => {
      if (this.usePlugins[pluginName]) {
        this[pluginName].init();
      }
    });
  }

  get basicModules() {}

  get provider() {}

  get oauth() {}
}

import PluginClassUtils from '@/class/PluginContainer/PluginClassUtils';

export default function PluginContainer(options, context, ClassPlugin) {
  const pluginsClassesList = PluginClassUtils.createPluginClassesList(
    options,
    ClassPlugin,
  );

  const pluginNames = pluginsClassesList.map(PluginClass => {
    return PluginClass.constructor.pluginName;
  });

  const pluginsMap = pluginsClassesList.reduce(
    (pluginInstanceMap, PluginClass) => {
      return Object.assign(pluginInstanceMap, {
        [PluginClass.constructor.pluginName]: new PluginClass(options, context),
      });
    },
    {},
  );

  pluginsMap.init = () => {
    pluginNames.forEach(pluginName => {
      pluginsMap[pluginName].init();
    });
  };

  // TODO refactor to Symbol.iterate
  pluginsMap.iterate = async handler => {
    await pluginNames.reduce(async (awaiter, pluginName) => {
      await awaiter;
      const plugin = pluginsMap[pluginName];
      await handler(plugin);
    }, Promise.resolve());
  };

  return PluginClassUtils.createAccessor(pluginsMap, pluginNames);
}

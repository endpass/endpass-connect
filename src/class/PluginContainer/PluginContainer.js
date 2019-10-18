import PluginClassUtils from '@/class/PluginContainer/PluginClassUtils';

export default function PluginContainer(options, context, ClassPlugin) {
  const pluginsClassesList = PluginClassUtils.createPluginClassesList(
    options,
    ClassPlugin,
  );

  const pluginsName = pluginsClassesList.map(PluginClass => {
    return PluginClass.pluginName;
  });

  const pluginsMap = pluginsClassesList.reduce(
    (pluginInstanceMap, PluginClass) => {
      return Object.assign(pluginInstanceMap, {
        [PluginClass.pluginName]: new PluginClass(options, context),
      });
    },
    {},
  );

  pluginsMap[Symbol.iterator] = function() {
    const privatePluginsName = [...pluginsName];
    return {
      next() {
        const pluginName = privatePluginsName.shift();

        return {
          done: !pluginName,
          value: !!pluginName && pluginsMap[pluginName],
        };
      },
    };
  };

  return PluginClassUtils.createAccessor(pluginsMap, pluginsName);
}

function hasClass(classesList, pluginName) {
  return classesList.find(PluginClass => PluginClass.pluginName === pluginName);
}

const PLUGIN_DIALOG = 'dialog';
const PLUGIN_MESSENGER_GROUP = 'messengerGroup';

export default class PluginClassUtils {
  static createPluginClassesList(options, ClassPlugin) {
    // please do not redefine order of plugins
    const pluginsClassesList = PluginClassUtils.createUniques([
      ...ClassPlugin.dependencyPlugins,
      ClassPlugin,
      ...(options.plugins || []),
    ]);

    return PluginClassUtils.getClassesWithOrder(pluginsClassesList);
  }

  static getClassesWithOrder(pluginsClassesList) {
    const dialogClass = pluginsClassesList.find(
      pluginClass => pluginClass.pluginName === PLUGIN_DIALOG,
    );

    const messengerGroupClass = pluginsClassesList.find(
      pluginClass => pluginClass.pluginName === PLUGIN_MESSENGER_GROUP,
    );

    const excludePlugins = [dialogClass, messengerGroupClass];
    const mainPlugins = pluginsClassesList.filter(
      pluginClass => !excludePlugins.includes(pluginClass.pluginName),
    );

    if (!dialogClass) {
      throw new Error('Not defined DialogPlugin in dependencies!');
    }

    if (!messengerGroupClass) {
      throw new Error('Not defined MessengerGroupPlugin in dependencies!');
    }

    return [dialogClass, ...mainPlugins, messengerGroupClass];
  }

  static createUniques(pluginsClasses, classesListResult = []) {
    return pluginsClasses.reduce((classesList, PluginClass) => {
      if (hasClass(classesList, PluginClass.pluginName)) {
        return classesList;
      }

      classesList.push(PluginClass);

      return PluginClassUtils.createUniques(
        PluginClass.dependencyPlugins,
        classesList,
      );
    }, classesListResult);
  }

  static createAccessor(pluginsMap) {
    return new Proxy(pluginsMap, {
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

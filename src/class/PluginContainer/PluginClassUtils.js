import { PLUGIN_NAMES } from '@/constants';

function getClassByName(classesList, pluginName) {
  return classesList.find(PluginClass => PluginClass.pluginName === pluginName);
}

const PLUGIN_DIALOG = PLUGIN_NAMES.DIALOG;
const PLUGIN_MESSENGER_GROUP = PLUGIN_NAMES.MESSENGER_GROUP;

export default class PluginClassUtils {
  static createPluginClassesList(options, ClassPlugin) {
    const optionPlugins = (options.plugins || []).map(
      ExportPlugin => ExportPlugin.ClassPlugin,
    );

    // please do not redefine order of plugins
    const pluginsClassesList = PluginClassUtils.createUniques([
      ...ClassPlugin.dependencyPlugins,
      ClassPlugin,
      ...optionPlugins,
    ]);

    return PluginClassUtils.getClassesWithOrder(pluginsClassesList);
  }

  static getClassesWithOrder(pluginsClassesList) {
    const dialogClass = getClassByName(pluginsClassesList, PLUGIN_DIALOG);

    const messengerGroupClass = getClassByName(
      pluginsClassesList,
      PLUGIN_MESSENGER_GROUP,
    );

    if (!dialogClass) {
      throw new Error('Not defined DialogPlugin in dependencies!');
    }

    if (!messengerGroupClass) {
      throw new Error('Not defined MessengerGroupPlugin in dependencies!');
    }

    const excludePlugins = [
      dialogClass.pluginName,
      messengerGroupClass.pluginName,
    ];

    const mainPlugins = pluginsClassesList.filter(
      pluginClass => !excludePlugins.includes(pluginClass.pluginName),
    );

    return [dialogClass, ...mainPlugins, messengerGroupClass];
  }

  static createUniques(pluginsClasses, classesListResult = []) {
    return pluginsClasses.reduce((classesList, PluginClass) => {
      if (getClassByName(classesList, PluginClass.pluginName)) {
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
      has(target, name) {
        return name in target;
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

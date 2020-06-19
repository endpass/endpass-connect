import { PLUGIN_NAMES } from '@/constants';

function getClassByName(classesList, pluginName) {
  return classesList.find(PluginClass => PluginClass.pluginName === pluginName);
}

const PLUGIN_BRIDGE = PLUGIN_NAMES.BRIDGE;
const PLUGIN_BROADCAST = PLUGIN_NAMES.BROADCAST;

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
    const BridgeClass = getClassByName(pluginsClassesList, PLUGIN_BRIDGE);

    const BroadcastClass = getClassByName(pluginsClassesList, PLUGIN_BROADCAST);

    if (!BridgeClass) {
      throw new Error('Not defined BridgePlugin in dependencies!');
    }

    if (!BroadcastClass) {
      throw new Error('Not defined BroadcastPlugin in dependencies!');
    }

    const excludePlugins = [BridgeClass.pluginName, BroadcastClass.pluginName];

    const mainPlugins = pluginsClassesList.filter(
      pluginClass => !excludePlugins.includes(pluginClass.pluginName),
    );

    return [BridgeClass, ...mainPlugins, BroadcastClass];
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

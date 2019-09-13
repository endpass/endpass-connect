import Context from '@/class/Context';
import { CONTEXT as context } from '@/constants';
import pkg from '../../package.json';

// OLD CONNECT
export default class PluginApiTrait {
  constructor(options, ClassPlugin) {
    if (ENV.isProduction) {
      /* eslint-disable-next-line */
      console.info(
        `%cEndpass connect:${ClassPlugin.pluginName} version ${pkg.version} created 🔌`,
        'color: #fff; background: #4B0873',
      );
    }

    this[context] = new Context(options, ClassPlugin);

    [...this[context].plugins].forEach(plugin => {
      const { publicApi } = plugin.constructor;
      Object.keys(publicApi).forEach(methodName => {
        this[methodName] = publicApi[methodName](plugin);
      });
    });
  }
}

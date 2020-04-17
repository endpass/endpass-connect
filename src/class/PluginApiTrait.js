import Context from '@/class/Context';
import { CONTEXT as context } from '@/constants';

// OLD CONNECT
export default class PluginApiTrait {
  constructor(options, ClassPlugin) {
    if (ENV.isShowConnectVersion) {
      /* eslint-disable-next-line */
      console.info(
        `%cEndpass connect:${ClassPlugin.pluginName} version ${ENV.version} created 🔌`,
        'font-size: 14px; font-weight: bold',
      );
    }

    this[context] = new Context(options, ClassPlugin);

    const defineMethod = (methodName, method) => {
      if (this[methodName]) {
        throw new Error(`Public api method "${methodName}" already exist!`);
      }
      this[methodName] = method;
    };

    [...this[context].plugins].forEach(plugin => {
      const { publicApi } = plugin.constructor;
      if (typeof publicApi === 'function') {
        // new plugins
        const methods = publicApi(plugin);
        Object.keys(methods).forEach(methodName => {
          defineMethod(methodName, methods[methodName]);
        });
      } else {
        // support old plugins
        Object.keys(publicApi).forEach(methodName => {
          defineMethod(methodName, publicApi[methodName](plugin));
        });
      }
    });
  }
}

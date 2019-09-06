import ConnectError from '@endpass/class/ConnectError';

import pkg from '../../../package.json';
import contextHandlers from './contextHandlers';
import HandlersFactory from '@/class/HandlersFactory';
import PluginFactory from '@/class/PluginFactory';
import DialogPlugin from '@/plugins/DialogPlugin';
import MessengerGroupPlugin from '@/plugins/MessengerGroupPlugin';

const { ERRORS } = ConnectError;

if (ENV.isProduction) {
  /* eslint-disable-next-line */
  console.info(
    `%cEndpass connect version ${pkg.version} loaded 🔌`,
    'color: #fff; background: #4B0873',
  );
}

/**
 * @typedef {import('@/plugins/PluginBase')} ConnectPlugin
 */

export default class Context {
  /**
   * @param {object} options
   * @param {ConnectPlugin} ClassPlugin plugin for singleton mode
   * @param {string} options.oauthClientId OAuth client id
   * @param {Array<ConnectPlugin>]} [options.plugins] list of plugins
   * @param {string} [options.authUrl] Url of hosted Endpass Connect Application
   * @param {string} [options.namespace] namespace for see difference,
   *  between two instances
   * @param {boolean} [options.isIdentityMode] isIdentityMode for define auth
   *  like identity
   * @param {object} [options.demoData] demoData passed object to auth
   * @param {object} [options.showCreateAccount] show create account form
   *  in auth dialog
   * @param {object} [options.widget] Widget configuration object.
   *  If provided widget will be mounted automatically
   * @param {object} [options.widget.position] Widget positions. By default
   *  equals to `bottom right`
   */
  constructor(options = {}, ClassPlugin) {
    this.options = options;

    this.contextHandlers = HandlersFactory.createHandlers(
      this,
      contextHandlers,
    );

    /**
     * @private
     */
    this.plugins = PluginFactory.createProxy({});

    // please do not redefine order of plugins
    const pluginClassesMap = PluginFactory.createUniqueClasses([
      DialogPlugin,

      ...ClassPlugin.dependencyPlugins,
      ClassPlugin,
      ...options.plugins,

      MessengerGroupPlugin,
    ]);

    Object.keys(pluginClassesMap).reduce((plugins, pluginKey) => {
      const PluginClass = pluginClassesMap[pluginKey];
      return Object.assign(plugins, {
        [pluginKey]: new PluginClass(options, this),
      });
    }, this.plugins);
  }

  get isLogin() {
    // from widget and stream call
    return this.plugins.authorize.isLogin;
  }

  async handleEvent(payload, req) {
    try {
      if (this.contextHandlers[req.method]) {
        await this.contextHandlers[req.method].apply(this, [payload, req]);
      }

      await Object.keys(this.plugins).reduce(async (awaiter, pluginKey) => {
        await awaiter;
        await this.plugins[pluginKey].handleEvent(payload, req);
      }, Promise.resolve());
    } catch (error) {
      console.error('context.handleEvent', error);
      const err = ConnectError.createFromError(error, ERRORS.NOT_DEFINED);
      req.answer({
        status: false,
        error: err,
        code: err.code,
      });
    }
  }

  executeMethod(method, payload) {
    const executor = async (resolve, reject) => {
      let isAnswered = false;
      const answer = (result = {}) => {
        isAnswered = true;
        const { status, error, code } = result;
        if (status === false) {
          const err = ConnectError.createFromError(error, code);
          reject(err);
        } else {
          resolve(result);
        }
      };
      const req = {
        method,
        answer,
      };
      await this.handleEvent(payload, req);
      if (!isAnswered) {
        answer();
      }
    };
    return new Promise(executor);
  }

  ask(method, payload) {
    return this.plugins.dialog.ask(method, payload);
  }
}

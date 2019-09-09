import ConnectError from '@endpass/class/ConnectError';

import pkg from '../../../package.json';
import contextHandlers from './contextHandlers';
import HandlersFactory from '@/class/HandlersFactory';
import PluginContainer from '@/class/PluginContainer';

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

    this.plugins = new PluginContainer(options, this, ClassPlugin);

    this.plugins.init();
  }

  get isLogin() {
    // from widget and stream call
    return this.plugins.authorize.isLogin;
  }

  ask(method, payload) {
    return this.plugins.dialog.ask(method, payload);
  }

  async handleEvent(payload, req) {
    try {
      if (this.contextHandlers[req.method]) {
        await this.contextHandlers[req.method].apply(this, [payload, req]);
      }

      // `this.plugins` iterable object to array
      await [...this.plugins].reduce(async (awaiter, plugin) => {
        await awaiter;
        await plugin.handleEvent(payload, req);
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
}

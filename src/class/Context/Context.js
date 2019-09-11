import ConnectError from '@endpass/class/ConnectError';

import contextHandlers from './contextHandlers';
import HandlersFactory from '@/class/HandlersFactory';
import PluginContainer from '@/class/PluginContainer';
import { PLUGIN_METHODS } from '@/constants';

const { ERRORS } = ConnectError;

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

    this.executeMethod(
      PLUGIN_METHODS.CONTEXT_MOUNT_WIDGET_ON_AUTH,
      options.widget,
    );
    this.executeMethod(PLUGIN_METHODS.CONTEXT_MOUNT_DIALOG);
  }

  get isLogin() {
    // from widget and stream call
    return this.plugins.authorize.isLogin;
  }

  /**
   *
   * @param {string} method
   * @param {*} payload
   * @return {Promise<*>}
   */
  ask(method, payload) {
    return this.plugins.dialog.ask(method, payload);
  }

  /**
   *
   * @param {*} payload
   * @param {object} originReq
   * @return {Promise<void>}
   */
  async handleEvent(payload, originReq) {
    let isAnswered = false;
    const proxyReq = {
      ...originReq,
      answer: result => {
        if (isAnswered) {
          return;
        }
        isAnswered = true;
        originReq.answer(result);
      },
    };

    try {
      if (this.contextHandlers[proxyReq.method]) {
        await this.contextHandlers[proxyReq.method](payload, proxyReq);
      }

      // `this.plugins` iterable object to array
      [...this.plugins].forEach(plugin => {
        plugin.handleEvent(payload, proxyReq);
      });
      proxyReq.answer();
    } catch (error) {
      console.error('context.handleEvent', error);
      const err = ConnectError.createFromError(error, ERRORS.NOT_DEFINED);
      proxyReq.answer({
        status: false,
        error: err,
        code: err.code,
      });
    }
  }

  /**
   *
   * @param {string} method
   * @param {*} payload
   * @return {Promise<*>}
   */
  executeMethod(method, payload) {
    const executor = async (resolve, reject) => {
      const answer = (result = {}) => {
        const { status, error, code } = result;
        if (status === false) {
          const err = ConnectError.createFromError(error, code);
          reject(err);
        } else {
          resolve(result);
        }
      };
      await this.handleEvent(payload, {
        method,
        answer,
      });
    };
    return new Promise(executor);
  }
}

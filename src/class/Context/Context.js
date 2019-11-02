// @ts-check

import ConnectError from '@/class/ConnectError';
import contextHandlers from './contextHandlers';
import HandlersFactory from '@/class/HandlersFactory';
import PluginContainer from '@/class/PluginContainer';

const { ERRORS } = ConnectError;

/**
 * @typedef {import('@/plugins/PluginBase')} ConnectPlugin
 */

/**
 * @typedef {object} ContextOptions
 * @property {string} oauthClientId OAuth client id
 * @property {Array<ConnectPlugin>} [plugins] list of plugins
 * @property {string} [authUrl] Url of hosted Endpass Connect Application
 * @property {string} [namespace] namespace for see difference,
 *  between two instances
 * @property {boolean} [isIdentityMode] isIdentityMode for define auth
 *  like identity
 * @property {object} [widget] Widget configuration object.
 *  If provided widget will be mounted automatically
 * @property {object} [widget.position] Widget positions. By default equals to `bottom right`
 */

/**
 * @typedef {object} ContextError
 * @property {number} code
 */

/**
 * @typedef {object} EventResult
 * @property {boolean} status
 * @property {NodeJS.ErrnoException} error
 * @property {keyof import('ConnectError').ERRORS} code
 */

/**
 * @typedef { { [key: string]: Function } } ContextHandlers
 */

/**
 * @typedef {object} OriginReq
 * @property {string} method
 * @property {Function} answer
 */

export default class Context {
  /**
   * @param {ContextOptions} options
   * @param {ConnectPlugin} ClassPlugin plugin for singleton mode
   */
  constructor(options, ClassPlugin) {
    this.options = options;

    if (!options.oauthClientId) {
      throw ConnectError.create(ERRORS.OAUTH_REQUIRE_ID);
    }

    /**
     * @type {ContextHandlers} ContextHandlers
     */
    this.contextHandlers = HandlersFactory.createHandlers(
      this,
      contextHandlers,
    );

    // @ts-ignore
    // We should define interface for constructor function, or use a class instead
    // Every of there ways require refactoring and change function signatures
    // So just ignore it at this moment
    this.plugins = new PluginContainer(options, this, ClassPlugin);
    this.plugins.init();
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
   * @param {OriginReq} originReq
   * @return {Promise<void>}
   */
  async handleEvent(payload, originReq) {
    let isAnswered = false;
    const proxyReq = {
      ...originReq,

      /**
       * @param {EventResult} [result]
       * @returns void
       */
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
    /**
     * @param {Function} resolve 
     * @param {Function} reject 
     */
    const executor = async (resolve, reject) => {
      /**
       * @param {EventResult} result 
       */
      const answer = result => {
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

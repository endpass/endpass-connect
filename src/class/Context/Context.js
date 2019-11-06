// @ts-check
import ConnectError from '@/class/ConnectError';
import contextHandlers from './contextHandlers';
import HandlersFactory from '@/class/HandlersFactory';
import PluginContainer from '@/class/PluginContainer';

const { ERRORS } = ConnectError;

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
     * @type {RequestEventHandlers} ContextHandlers
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

  /**
   * @returns {boolean}
   */
  get isLogin() {
    // from widget and stream call
    return this.plugins.authorize.isLogin;
  }

  /**
   * @param {RequestMethodsValues} method
   * @param {any} payload
   * @returns {Promise<any>}
   */
  ask(method, payload) {
    return this.plugins.dialog.ask(method, payload);
  }

  /**
   * @param {any} payload
   * @param {OriginReq} originReq
   * @returns {Promise<void>}
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
   * @param {RequestMethodsValues} method
   * @param {any} [payload]
   * @returns {Promise<any>}
   */
  executeMethod(method, payload) {
    /**
     * @param {Function} resolve 
     * @param {Function} reject 
     * @returns {Promise<void>}
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

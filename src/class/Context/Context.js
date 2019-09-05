import ConnectError from '@endpass/class/ConnectError';
import { METHODS } from '@/constants';
import PluginFactory from '@/class/PluginFactory';

import { getFrameRouteUrl } from '@/util/url';
import MessengerGroup from '@/class/MessengerGroup';
import Dialog from '@/class/Dialog';
import EventSubscriber from '@/class/EventSubscriber';
import contextHandlers from './contextHandlers';
import HandlersFactory from '@/class/HandlersFactory';
import pkg from '../../../package.json';

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

// TODO: remove context to plugin container, and move near by
export default class Context {
  /**
   * @param {object} options
   * @param {string} options.oauthClientId OAuth client id
   * @param {ConnectPlugin} singlePlugin plugin for sinletone mode
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
  constructor(options = {}, singlePlugin) {
    const passedPlugins = options.plugins || [];
    this.options = options;
    this.contextHandlers = HandlersFactory.createHandlers(
      this,
      contextHandlers,
    );

    this.plugins = PluginFactory.createPlugins(passedPlugins, {
      options,
      context: this,
    });

    if (singlePlugin) {
      this.plugins[singlePlugin.constructor.pluginName] = singlePlugin;
    }

    EventSubscriber.subscribe(this);
  }

  get subscribeData() {
    const { plugins } = this;
    const basicData = [...this.getDialog().subscribeData];
    const res = Object.keys(plugins).reduce((eventsList, pluginKey) => {
      const plugin = plugins[pluginKey];
      return eventsList.concat(plugin.subscribeData);
    }, basicData);

    return res;

    // [[messenger], [messenger]]
  }

  get isLogin() {
    return this.plugins.auth.isLogin;
  }

  async serverAuth() {
    await this.plugins.provider.serverAuth();
  }

  /**
   * Define Current request
   * @param {Web3.Provider} reqProvider Web3 provider instance
   */
  setRequestProvider(reqProvider) {
    this.plugins.provider.setRequestProvider(reqProvider);
  }

  /**
   * Sets settings to current `web3` provider injected to page with `injectWeb3`
   * method
   * @param {object} payload
   * @param {string} payload.activeAccount Currenct account checksummed address
   * @param {string} payload.activeNet Active network ID
   */
  setProviderSettings(payload) {
    this.plugins.provider.setInpageProviderSettings(payload);

    const settings = this.getInpageProviderSettings();
    this.messengerGroup.send(METHODS.CHANGE_SETTINGS_RESPONSE, settings);
  }

  getRequestProvider() {
    return this.plugins.provider.getRequestProvider();
  }

  getInpageProviderSettings() {
    return this.plugins.provider.getInpageProviderSettings();
  }

  getEmitter() {
    return this.plugins.provider.getEmitter();
  }

  getDialog() {
    if (!this.dialog) {
      const { element, namespace, authUrl } = this.options;
      this.dialog = new Dialog({
        element,
        namespace,
        url: getFrameRouteUrl(authUrl, 'bridge'),
      });
      this.messengerGroup.addMessenger(this.dialog.getDialogMessenger());
    }

    return this.dialog;
  }

  async handleEvent(payload, req) {
    console.log('req.method', req.method);
    try {
      // 1. process context methods
      if (this.contextHandlers[req.method]) {
        await this.contextHandlers[req.method].apply(this, [payload, req]);
      }

      // 2. process dialog methods
      await this.getDialog().handleEvent(payload, req);

      // 3. process plugins methods
      await Object.keys(this.plugins).reduce(async (awaiter, pluginKey) => {
        await awaiter;
        await this.plugins[pluginKey].handleEvent(payload, req);
      }, Promise.resolve());

      // 4. process messenger group
      this.messengerGroup.handleEvent(payload, req);
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

  handleRequest(method, payload) {
    return new Promise((resolve, reject) => {
      const req = {
        method,
        answer(result) {
          const { status, error, code } = result;
          if (!status) {
            const err = ConnectError.createFromError(error, code);
            reject(err);
          } else {
            resolve(result);
          }
        },
      };
      this.handleEvent(payload, req);
    });
  }

  /**
   *
   * @return {MessengerGroup}
   */
  get messengerGroup() {
    if (!this.messengerGroupPrivate) {
      this.messengerGroupPrivate = new MessengerGroup();
    }
    return this.messengerGroupPrivate;
  }
}

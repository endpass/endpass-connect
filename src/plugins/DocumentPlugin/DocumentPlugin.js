import ConnectError from '@/class/ConnectError';
import PluginBase from '../PluginBase';
import { BridgePlugin } from '@/plugins/BridgePlugin';
import { BroadcastPlugin } from '@/plugins/BroadcastPlugin';
import DocumentPublicApi from './DocumentPublicApi';
import { MESSENGER_METHODS, PLUGIN_NAMES } from '@/constants';

const { ERRORS } = ConnectError;

export default class DocumentPlugin extends PluginBase {
  static get pluginName() {
    return PLUGIN_NAMES.DOCUMENT;
  }

  static get dependencyPlugins() {
    return [BridgePlugin, BroadcastPlugin];
  }

  static get publicApi() {
    return DocumentPublicApi;
  }

  /**
   * @param {object?} params
   * @return {Promise<object>}
   */
  async createDocument(params) {
    const { status, code, payload = {} } = await this.context.ask(
      MESSENGER_METHODS.CREATE_DOCUMENT,
      params,
    );

    if (!status) {
      throw ConnectError.create(code || ERRORS.CREATE_DOCUMENT);
    }

    return payload;
  }

  async createDocumentsRequired(params) {
    const { status, code, payload = {} } = await this.context.ask(
      MESSENGER_METHODS.CREATE_DOCUMENTS_REQUIRED,
      params,
    );

    if (!status) {
      throw ConnectError.create(code || ERRORS.CREATE_DOCUMENTS_REQUIRED);
    }

    return payload;
  }
}

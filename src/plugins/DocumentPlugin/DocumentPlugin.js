import ConnectError from '@/class/ConnectError';
import PluginBase from '../PluginBase';
import { DialogPlugin } from '@/plugins/DialogPlugin';
import { MessengerGroupPlugin } from '@/plugins/MessengerGroupPlugin';
import DocumentPublicApi from './DocumentPublicApi';
import { MESSENGER_METHODS, PLUGIN_NAMES } from '@/constants';

const { ERRORS } = ConnectError;

export default class DocumentPlugin extends PluginBase {
  static get pluginName() {
    return PLUGIN_NAMES.DOCUMENT;
  }

  static get dependencyPlugins() {
    return [DialogPlugin, MessengerGroupPlugin];
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
}

import ConnectError from '@endpass/class/ConnectError';
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
   *
   * @return {Promise<object>}
   */
  async createDocument() {
    const { status, code, payload = {} } = await this.context.ask(
      MESSENGER_METHODS.CREATE_DOCUMENT,
    );

    if (!status) {
      throw ConnectError.create(code || ERRORS.CREATE_DOCUMENT);
    }

    return payload;
  }
}

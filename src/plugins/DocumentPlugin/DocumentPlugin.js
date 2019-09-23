import PluginBase from '../PluginBase';
import { DialogPlugin } from '@/plugins/DialogPlugin';
import { MessengerGroupPlugin } from '@/plugins/MessengerGroupPlugin';
import DocumentPublicApi from './DocumentPublicApi';
import { MESSENGER_METHODS, PLUGIN_NAMES } from '@/constants';

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

  async createDocument() {
    return this.context.ask(MESSENGER_METHODS.CREATE_DOCUMENT);
  }
}

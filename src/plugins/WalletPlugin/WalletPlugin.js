import ConnectError from '@/class/ConnectError';
import PluginBase from '../PluginBase';
import { DialogPlugin } from '@/plugins/DialogPlugin';
import { MessengerGroupPlugin } from '@/plugins/MessengerGroupPlugin';
import WalletPublicApi from './WalletPublicApi';
import { MESSENGER_METHODS, PLUGIN_NAMES } from '@/constants';

const { ERRORS } = ConnectError;

export default class WalletPlugin extends PluginBase {
  static get pluginName() {
    return PLUGIN_NAMES.WALLET;
  }

  static get dependencyPlugins() {
    return [DialogPlugin, MessengerGroupPlugin];
  }

  static get publicApi() {
    return WalletPublicApi;
  }

  /**
   *
   * @return {Promise<object>}
   */
  async generateWallet() {
    const { status, code, payload = {} } = await this.context.ask(
      MESSENGER_METHODS.GENERATE_WALLET,
    );

    if (!status) {
      throw ConnectError.create(code || ERRORS.CREATE_WALLET);
    }

    return payload;
  }
}

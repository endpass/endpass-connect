import PluginBase from '@/plugins/PluginBase';
import PluginFactory from '@/class/PluginFactory';
import { DialogPlugin } from '@/plugins/DialogPlugin';
import { MessengerGroupPlugin } from '@/plugins/MessengerGroupPlugin';
import { PLUGIN_NAMES } from '@/constants';

export class ComposePlugin extends PluginBase {
  static get pluginName() {
    return PLUGIN_NAMES.COMPOSE;
  }

  static get dependencyPlugins() {
    return [DialogPlugin, MessengerGroupPlugin];
  }
}

export default PluginFactory.create(ComposePlugin);

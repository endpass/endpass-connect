import PluginBase from '@/plugins/PluginBase';
import PluginFactory from '@/class/PluginFactory';
import DialogPlugin from '@/plugins/DialogPlugin';
import MessengerGroupPlugin from '@/plugins/MessengerGroupPlugin';

class ConnectPlugin extends PluginBase {
  static get pluginName() {
    return 'connect';
  }

  static get dependencyPlugins() {
    return [DialogPlugin, MessengerGroupPlugin];
  }
}

export default PluginFactory.create(ConnectPlugin);

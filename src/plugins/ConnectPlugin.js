import OauthPlugin from '@/plugins/OauthPlugin';
import WidgetPlugin from '@/plugins/WidgetPlugin';
import AuthorizePlugin from '@/plugins/AuthorizePlugin';
import PluginBase from '@/plugins/PluginBase';
import PluginFactory from '@/class/PluginFactory';
import DialogPlugin from '@/plugins/DialogPlugin';
import MessengerGroupPlugin from '@/plugins/MessengerGroupPlugin';

class ConnectPlugin extends PluginBase {
  static get pluginName() {
    return 'connect';
  }

  static get dependencyPlugins() {
    return [DialogPlugin, AuthorizePlugin, OauthPlugin, WidgetPlugin];
  }

  static get lastPlugins() {
    return [MessengerGroupPlugin];
  }
}

export default PluginFactory.create(ConnectPlugin);

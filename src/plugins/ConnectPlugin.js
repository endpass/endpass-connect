import OauthPlugin from '@/plugins/OauthPlugin';
import WidgetPlugin from '@/plugins/WidgetPlugin';
import AuthorizePlugin from '@/plugins/AuthorizePlugin';
import PluginBase from '@/plugins/PluginBase';
import PluginFactory from '@/class/PluginFactory';

class ConnectPlugin extends PluginBase {
  static get pluginName() {
    return 'connect';
  }

  static get dependencyPlugins() {
    return [AuthorizePlugin, OauthPlugin, WidgetPlugin];
  }
}

export default PluginFactory.create(ConnectPlugin);

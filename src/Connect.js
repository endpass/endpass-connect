import OauthPlugin from '@/plugins/OauthPlugin';
import WidgetPlugin from '@/plugins/WidgetPlugin';
import AuthPlugin from '@/plugins/AuthPlugin';
import PluginBase from '@/plugins/PluginBase';

export default class Connect extends PluginBase {
  static get pluginName() {
    return 'connect';
  }

  static get dependencyPlugins() {
    return [AuthPlugin, OauthPlugin, WidgetPlugin];
  }
}

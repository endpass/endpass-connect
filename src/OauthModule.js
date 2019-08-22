import Plugin from '@/plugins/Plugin';

export default class OauthModule extends Plugin {
  constructor(context, options) {
    super(context);
  }

  static pluginName() {
    return 'oauth';
  }
}

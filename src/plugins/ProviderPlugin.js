import Plugin from '@/plugins/Plugin';

export default class ProviderPlugin extends Plugin {
  constructor(context, options) {
    super(context);
  }

  static pluginName() {
    return 'provider';
  }
}

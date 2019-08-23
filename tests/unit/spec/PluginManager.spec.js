import PluginManager from '@/PluginManager';
import Plugin from '@/plugins/Plugin';

describe('plugin manager', () => {
  class TestPlugin extends Plugin {
    static getName() {
      // get from available plugins
      return 'auth';
    }

    constructor(props) {
      super(props);
      this.init = jest.fn();
    }
  }

  const dialog = {
    ask: jest.fn(),
  };
  const context = {
    getDialog() {
      return dialog;
    },
  };

  it('should create plugins by list', () => {
    const plugins = PluginManager.createPlugins([TestPlugin], { context });
    expect(plugins[TestPlugin.getName()]).toBeInstanceOf(TestPlugin);
    expect(plugins.auth.init).not.toBeCalled();
  });

  it('should initiate plugins', () => {
    const plugins = PluginManager.createPlugins([TestPlugin], { context });
    PluginManager.initPlugins(plugins);
    expect(plugins.auth.init).toBeCalled();
  });

  it('should throw error, if not defined name of plugin', () => {
    try {
      PluginManager.createPlugins([Plugin], { context });
    } catch (e) {
      const err = new Error('Please define plugin name');
      expect(e).toEqual(err);
    }
  });

  it('should throw error, if trying to get not defined plugin', () => {
    const plugins = PluginManager.createPlugins([TestPlugin], { context });
    try {
      // eslint-disable-next-line
      const provider = plugins.provider;
    } catch (e) {
      const err = new Error(`Please define 'provider' plugin`);
      expect(e).toEqual(err);
    }
  });
});

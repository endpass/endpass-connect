import ConnectError from '@/class/ConnectError';
import { ProviderPlugin } from '@/plugins/ProviderPlugin';
import ProviderFactory from '@/plugins/ProviderPlugin/ProviderFactory';
import InpageProvider from '@/plugins/ProviderPlugin/InpageProvider';
import { MESSENGER_METHODS, PLUGIN_METHODS } from '@/constants';

const { ERRORS } = ConnectError;

describe('Provider plugin', () => {
  let plugin;
  const options = {};

  const context = {
    ask: jest.fn(),
    executeMethod: jest.fn(),
    isLogin: true,
  };

  const createPlugin = () => {
    const inst = new ProviderPlugin(options, context);
    // inst.emitter = emitter;
    inst.init();
    return inst;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    plugin = createPlugin();
  });

  describe('initial', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create instance of plugin', () => {
      expect(plugin).toBeInstanceOf(ProviderPlugin);
    });

    it('should not create request provider until it called', () => {
      jest.spyOn(ProviderFactory, 'createRequestProvider');
      plugin = createPlugin();
      expect(ProviderFactory.createRequestProvider).not.toBeCalled();

      plugin.getRequestProvider();

      expect(ProviderFactory.createRequestProvider).toBeCalled();
    });

    it('should return Inpage provider from given parameters', () => {
      jest.spyOn(ProviderFactory, 'createRequestProvider');
      plugin = createPlugin();
      const res = plugin.getInpageProvider();

      expect(res instanceof InpageProvider).toBe(true);
    });

    it('should define request provider by setter', () => {
      plugin = createPlugin();
      const provider = {};

      expect(plugin.requestProvider).toBe(undefined);

      plugin.setRequestProvider(provider);

      expect(plugin.getRequestProvider()).toBe(provider);
    });
  });

  describe('getAccountData', () => {
    beforeEach(() => {
      context.ask = jest.fn().mockResolvedValueOnce({
        status: true,
        payload: {
          settings: {
            lastActiveAccount: '0x0',
            net: 1,
            foo: 'bar',
            bar: 'baz',
          },
        },
      });
    });

    it('should request user settings with private method and returns formatted value', async () => {
      expect.assertions(2);

      const res = await plugin.getProviderAccountData();

      expect(res).toEqual({
        activeAccount: '0x0',
        activeNet: 1,
      });
      expect(context.executeMethod)
        .toBeCalledWith(PLUGIN_METHODS.CONTEXT_SET_PROVIDER_SETTINGS, res);
    });

    it('should request user settings through inner connect bridge', async () => {
      expect.assertions(3);

      const settings = {
        lastActiveAccount: 'lastActiveAccount',
        net: 'net',
      };
      const response = {
        status: true,
        payload: {
          settings,
        },
      };
      context.ask = jest.fn().mockResolvedValueOnce(response);

      const res = await plugin.getProviderAccountData();

      expect(context.ask).toBeCalledWith(MESSENGER_METHODS.GET_SETTINGS);

      expect(res).toEqual({
        activeAccount: settings.lastActiveAccount,
        activeNet: settings.net,
      });
      expect(context.executeMethod)
        .toBeCalledWith(PLUGIN_METHODS.CONTEXT_SET_PROVIDER_SETTINGS, res);
    });

    it('should throw error is request account status is falsy', async () => {
      expect.assertions(2);

      context.ask = jest.fn().mockResolvedValueOnce({
        status: false,
        code: ERRORS.USER_NOT_AUTHORIZED,
      });

      try {
        await plugin.getProviderAccountData();
      } catch (e) {
        const err = new Error('User not authorized!');
        expect(e).toEqual(err);
        expect(e.code).toBe(ERRORS.USER_NOT_AUTHORIZED);
      }
    });
  });

  describe('openAccount', () => {
    it('should open connect application and awaits any signals from it', async () => {
      expect.assertions(2);

      context.ask.mockResolvedValueOnce({
        status: true,
        payload: {
          type: 'foo',
        },
      });

      const res = await plugin.openProviderAccount();

      expect(context.ask).toBeCalledWith(MESSENGER_METHODS.ACCOUNT);
      expect(res).toEqual({
        type: 'foo',
        settings: undefined,
      });
    });

    it('should open connect application and returns payload if response type is "update"', async () => {
      expect.assertions(1);

      const payload = {
        wrongField: 'wrongField',
        type: 'update',
        settings: 'settings',
      };

      context.ask.mockResolvedValueOnce({
        status: true,
        payload,
      });

      const res = await plugin.openProviderAccount();

      expect(res).toEqual({
        type: 'update',
        settings: 'settings',
      });
    });

    it('should throw error if request status is falsy', async () => {
      expect.assertions(1);

      context.ask.mockResolvedValueOnce({
        status: false,
      });

      try {
        await plugin.openProviderAccount();
      } catch (e) {
        const err = new Error('Account updating failed!');
        expect(e).toEqual(err);
      }
    });
  });
});

import ConnectError from '@endpass/class/ConnectError';
import ProviderComponent from '@/plugins/ProviderPlugin';
import ProviderFactory from '@/class/ProviderFactory';
import InpageProvider from '@/class/InpageProvider';
import { MESSENGER_METHODS } from '@/constants';

const { ERRORS } = ConnectError;

describe('Provider plugin', () => {
  let plugin;
  const dialog = {
    ask: jest.fn(),
  };

  const emitter = {
    emit: jest.fn(),
    on: jest.fn(),
  };

  const context = {
    getEmitter() {
      return emitter;
    },
    getDialog() {
      return dialog;
    },
    setProviderSettings: jest.fn(),
    isLogin: true,
    serverAuth: jest.fn(),
  };

  const createPlugin = () => {
    const inst = new ProviderComponent({ context });
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
      expect(plugin).toBeInstanceOf(ProviderComponent);
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
      const res = plugin.getProvider();

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
      dialog.ask = jest.fn().mockResolvedValueOnce({
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
      expect.assertions(1);

      const res = await plugin.getAccountData();

      expect(res).toEqual({
        activeAccount: '0x0',
        activeNet: 1,
      });
    });

    it('should request user settings through inner connect bridge', async () => {
      expect.assertions(2);

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
      dialog.ask = jest.fn().mockResolvedValueOnce(response);

      const res = await plugin.getAccountData();

      expect(dialog.ask).toBeCalledWith(MESSENGER_METHODS.GET_SETTINGS);

      expect(res).toEqual({
        activeAccount: settings.lastActiveAccount,
        activeNet: settings.net,
      });
    });

    it('should throw error is request account status is falsy', async () => {
      expect.assertions(2);

      dialog.ask = jest.fn().mockResolvedValueOnce({
        status: false,
        code: ERRORS.USER_NOT_AUTHORIZED,
      });

      try {
        await plugin.getAccountData();
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

      dialog.ask.mockResolvedValueOnce({
        status: true,
        payload: {
          type: 'foo',
        },
      });

      const res = await plugin.openAccount();

      expect(dialog.ask).toBeCalledWith(MESSENGER_METHODS.ACCOUNT);
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

      dialog.ask.mockResolvedValueOnce({
        status: true,
        payload,
      });

      const res = await plugin.openAccount();

      expect(res).toEqual({
        type: 'update',
        settings: 'settings',
      });
    });

    it('should throw error if request status is falsy', async () => {
      expect.assertions(1);

      dialog.ask.mockResolvedValueOnce({
        status: false,
      });

      try {
        await plugin.openAccount();
      } catch (e) {
        const err = new Error('Account updating failed!');
        expect(e).toEqual(err);
      }
    });
  });
});

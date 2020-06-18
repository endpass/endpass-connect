import ConnectError from '@/class/ConnectError';
import {
  CONTEXT,
  MESSENGER_METHODS,
  INPAGE_EVENTS,
  PLUGIN_NAMES,
} from '@/constants';
import ProviderPlugin, {
  ProviderPlugin as ProviderPluginClass,
} from '@/plugins/ProviderPlugin';
import ComposePlugin from '@/plugins/ComposePlugin';
import AuthorizePlugin from '@/plugins/AuthorizePlugin';
import WidgetPlugin from '@/plugins/WidgetPlugin';

const { ERRORS } = ConnectError;

describe('Context class', () => {
  const authUrl = 'http://test.auth';
  const originLocation = 'http://localhost';
  const clientId = 'xxxxxxxxxx';
  const options = {
    authUrl,
    clientId,
  };
  let context;
  let connect;

  const createContext = opt => {
    connect = new ComposePlugin({ ...options, ...opt });
    context = connect[CONTEXT];
  };

  beforeAll(() => {
    window.open = jest.fn();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    createContext();
  });

  describe('initiate', () => {
    it('should create with default plugins', () => {
      const pluginList = [...context.plugins].map(
        item => item.constructor.pluginName,
      );

      expect(pluginList).toEqual([
        PLUGIN_NAMES.BRIDGE,
        PLUGIN_NAMES.COMPOSE,
        PLUGIN_NAMES.MESSENGER_GROUP,
      ]);
      expect(pluginList).toHaveLength(3);
    });

    it('should create with provider plugin', () => {
      createContext({ plugins: [ProviderPlugin] });

      expect(context.plugins[ProviderPluginClass.pluginName]).not.toBe(
        undefined,
      );
    });

    it('should pass initial payload', async () => {
      expect.assertions(1);

      const payload = {};
      const req = {
        method: MESSENGER_METHODS.INITIATE,
        answer: jest.fn(),
      };
      createContext({
        isIdentityMode: false,
      });

      await context.handleEvent(payload, req);

      expect(req.answer).toBeCalledWith({
        isIdentityMode: false,
        originLocation,
      });
    });
  });

  describe('setProviderSettings', () => {
    let emitter;
    beforeEach(() => {
      emitter = {
        emit: jest.fn(),
      };
      createContext({ plugins: [ProviderPlugin] });

      context.plugins.provider.emitter = emitter;
      context.plugins.messengerGroup.send = jest.fn();
    });

    it('should emit settings by inner connect emitter', async () => {
      expect.assertions(2);

      const payload = {
        activeAccount: '0x0',
        activeNet: 2,
      };

      context.plugins.provider.getInpageProviderSettings = jest.fn(
        () => payload,
      );

      await connect.setProviderSettings(payload);

      expect(context.plugins.provider.emitter.emit).toBeCalledWith(
        INPAGE_EVENTS.SETTINGS,
        payload,
      );
      expect(context.plugins.messengerGroup.send).toBeCalledWith(
        MESSENGER_METHODS.CHANGE_SETTINGS_RESPONSE,
        payload,
      );
    });
  });

  describe('serverAuth', () => {
    it('should cancel login if answer is bad', async () => {
      expect.assertions(2);

      createContext({ plugins: [ProviderPlugin] });
      context.plugins.bridge.ask = jest.fn().mockResolvedValueOnce({
        status: false,
        code: ERRORS.AUTH_CANCELED_BY_USER,
      });

      try {
        await connect.getAccountData();
      } catch (e) {
        expect(e.code).toBe(ERRORS.AUTH_CANCELED_BY_USER);
      }

      expect(context.plugins.authorize.isLogin).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout from endpass', async () => {
      expect.assertions(3);

      createContext({ plugins: [AuthorizePlugin] });

      context.plugins.bridge.ask = jest.fn().mockResolvedValueOnce({
        status: true,
      });
      context.plugins.messengerGroup.send = jest.fn();

      const res = await connect.logout();

      expect(res).toBe(true);
      expect(context.plugins.messengerGroup.send).toBeCalledWith(
        MESSENGER_METHODS.LOGOUT_RESPONSE,
      );
      expect(context.plugins.bridge.ask).toBeCalledWith(
        MESSENGER_METHODS.LOGOUT,
        undefined,
      );
    });
  });

  describe('widget', () => {
    const req = {
      method: MESSENGER_METHODS.AUTH_STATUS,
      answer: jest.fn(),
    };

    it('should automatically mount widget', async () => {
      expect.assertions(2);

      createContext({ plugins: [WidgetPlugin], widget: true });

      expect(context.plugins.widget.isMounted).toBe(false);

      await context.handleEvent({ status: true }, req);

      expect(context.plugins.widget.isMounted).toBe(true);
    });

    it('should not mount widget', async () => {
      expect.assertions(2);

      createContext({ plugins: [WidgetPlugin], widget: false });

      expect(context.plugins.widget.isMounted).toBe(false);

      await context.handleEvent({ status: true }, req);

      expect(context.plugins.widget.isMounted).toBe(false);
    });
  });
});

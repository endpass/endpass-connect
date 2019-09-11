import ConnectError from '@endpass/class/ConnectError';
import Context from '@/class/Context';
import { MESSENGER_METHODS, INPAGE_EVENTS } from '@/constants';
import ProviderPlugin from '@/plugins/ProviderPlugin';

const { ERRORS } = ConnectError;

describe.skip('Context class', () => {
  const authUrl = 'http://test.auth';
  const oauthClientId = 'xxxxxxxxxx';
  const options = {
    authUrl,
    oauthClientId,
  };
  let context;
  const dialog = {
    ask: jest.fn(),
  };
  const msgGroup = {
    send: jest.fn(),
    addMessenger: jest.fn(),
    removeMessenger: jest.fn(),
  };

  beforeAll(() => {
    window.open = jest.fn();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context = new Context(options);
  });

  describe('initiate', () => {
    it('should create with default plugins', () => {
      context = new Context(options);
      expect(Object.keys(context.plugins)).toHaveLength(3);
    });

    it('should create with provider plugin', () => {
      context = new Context({ ...options, plugins: [ProviderPlugin] });
      expect(Object.keys(context.plugins)).toHaveLength(4);
      expect(context.plugins[ProviderPlugin.pluginName]).toBeInstanceOf(
        ProviderPlugin,
      );
    });
  });

  describe('setProviderSettings', () => {
    let emitter;
    beforeEach(() => {
      emitter = {
        emit: jest.fn(),
      };
      context = new Context({ ...options, plugins: [ProviderPlugin] });
      context.plugins.provider.getEmitter = () => emitter;

      context.plugins.elements.messengerGroup = () => msgGroup;
    });

    it('should emit settings by inner connect emitter', () => {
      const payload = {
        activeAccount: '0x0',
        activeNet: 2,
      };

      context.plugins.provider.getInpageProviderSettings = jest.fn(
        () => payload,
      );
      context.setProviderSettings(payload);

      expect(context.getEmitter().emit).toBeCalledWith(
        INPAGE_EVENTS.SETTINGS,
        payload,
      );
      expect(
        context.plugins.elements.messengerGroup().send,
      ).toBeCalledWith(MESSENGER_METHODS.CHANGE_SETTINGS_RESPONSE, payload);
    });
  });

  describe('serverAuth', () => {
    beforeEach(() => {
      context = new Context({ ...options, plugins: [ProviderPlugin] });
      context.plugins.elements.getDialogInstance = dialog;
      context.auth = jest.fn();
      context.getDialog = () => dialog;
    });

    it('should call only once getAccountData', async () => {
      expect.assertions(2);

      dialog.ask.mockResolvedValueOnce({
        status: false,
        code: ERRORS.AUTH_CANCELED_BY_USER,
      });

      try {
        await context.serverAuth();
      } catch (e) {
        expect(e.code).toBe(ERRORS.AUTH_CANCELED_BY_USER);
      }

      expect(context.auth).not.toBeCalled();
    });
  });

  describe('logout', () => {
    it('should logout from endpass', async () => {
      const logoutResult = 'result';
      context.plugins.auth.getAuthInstance = () => {
        return {
          logout() {
            return logoutResult;
          },
        };
      };
      context.plugins.elements.messengerGroup = () => {
        return msgGroup;
      };

      const res = await context.logout();
      expect(res).toBe(logoutResult);
      expect(msgGroup.send).toBeCalledWith(MESSENGER_METHODS.LOGOUT_RESPONSE);
    });
  });
});

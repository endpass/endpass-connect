import ConnectError from '@endpass/class/ConnectError';
import Connect from '@/Connect';
import ProviderPlugin from '@/plugins/ProviderPlugin';
import privateFields from '@/privateFields';
import ProviderFactory from '@/class/ProviderFactory';
import InpageProvider from '@/class/InpageProvider';
import { INPAGE_EVENTS, METHODS } from '@/constants';

const { ERRORS } = ConnectError;

describe('Connect class', () => {
  let connect;
  let context;
  const authUrl = 'http://test.auth';
  const oauthClientId = 'xxxxxxxxxx';
  const plugins = [ProviderPlugin];
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
    connect = new Connect({ authUrl, oauthClientId, plugins });
    context = connect[privateFields.context];
  });

  describe('initial', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create instance of connect if all authUrl present', () => {
      connect = new Connect({ authUrl, oauthClientId });
      expect(connect).toBeInstanceOf(Connect);
    });

    it('should not create request provider until it called', () => {
      jest.spyOn(ProviderFactory, 'createRequestProvider');

      connect = new Connect({ authUrl, oauthClientId, plugins });

      expect(ProviderFactory.createRequestProvider).not.toBeCalled();
    });

    it('should return Inpage provider from given parameters', () => {
      connect = new Connect({ authUrl, oauthClientId, plugins });
      const res = connect.getProvider();

      expect(res instanceof InpageProvider).toBe(true);
    });
  });

  describe('setProviderSettings', () => {
    let emitter;

    beforeEach(() => {
      emitter = {
        emit: jest.fn(),
      };
      context.plugins.provider.getEmitter = () => {
        return emitter;
      };

      context.plugins.elements.getMessengerGroupInstance = () => {
        return msgGroup;
      };
    });

    it('should emit settings by inner connect emitter', () => {
      const payload = {
        activeAccount: '0x0',
        activeNet: 2,
      };

      context.plugins.provider.getInpageProviderSettings = jest.fn(
        () => payload,
      );
      connect.setProviderSettings(payload);

      expect(context.getEmitter().emit).toBeCalledWith(
        INPAGE_EVENTS.SETTINGS,
        payload,
      );
      expect(
        context.plugins.elements.getMessengerGroupInstance().send,
      ).toBeCalledWith(METHODS.CHANGE_SETTINGS_RESPONSE, payload);
    });
  });

  describe('getProvider', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      connect = new Connect({ authUrl, oauthClientId, plugins });
    });

    it('should return Inpage provider from given parameters', () => {
      const res = connect.getProvider();

      expect(res instanceof InpageProvider).toBe(true);
    });
  });

  describe('getAccountData', () => {
    beforeEach(() => {
      context.getDialog = () => {
        return dialog;
      };
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

      context.plugins.elements.getMessengerGroupInstance = () => {
        return msgGroup;
      };
    });

    it('should request user settings with private method and returns formatted value', async () => {
      expect.assertions(1);

      const res = await connect.getAccountData();

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

      const res = await connect.getAccountData();

      expect(dialog.ask).toBeCalledWith(METHODS.GET_SETTINGS);

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
        await connect.getAccountData();
      } catch (e) {
        const err = new Error('User not authorized!');
        expect(e).toEqual(err);
        expect(e.code).toBe(ERRORS.USER_NOT_AUTHORIZED);
      }
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
      context.plugins.elements.getMessengerGroupInstance = () => {
        return msgGroup;
      };

      const res = await connect.logout();
      expect(res).toBe(logoutResult);
      expect(msgGroup.send).toBeCalledWith(METHODS.LOGOUT_RESPONSE);
    });
  });
});

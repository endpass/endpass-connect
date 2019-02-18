import Connect from '@/lib/Connect';
import { INPAGE_EVENTS, METHODS } from '../../../src/constants';
import privateFields from '@/lib/privateFields';

describe('Connect class – public methods', () => {
  let connect;
  let privateMethods;
  let context;

  beforeAll(() => {
    window.open = jest.fn();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    connect = new Connect({ appUrl: 'http://localhost:5000' });
    // eslint-disable-next-line
    privateMethods = connect[privateFields.methods];
    // eslint-disable-next-line
    context = connect[privateFields.context];
  });

  describe('createProvider', () => {
    const web3 = {
      foo: 'bar',
    };

    beforeEach(() => {
      window.web3 = undefined;
      privateMethods.createRequestProvider = jest.fn();
    });

    it('should extend provider with web3 from given parameters', () => {
      connect.extendProvider(web3);

      expect(privateMethods.createRequestProvider).toBeCalledWith(web3);
    });

    it('should throw error if web3 is not passed as parameter and it is not exist in window', () => {
      expect(() => {
        connect.createProvider();
      }).toThrow();
    });
  });

  describe('getAccountData', () => {
    beforeEach(() => {
      privateMethods.getUserSettings = jest.fn().mockResolvedValueOnce({
        lastActiveAccount: '0x0',
        net: 1,
        foo: 'bar',
        bar: 'baz',
      });
    });

    it('should request user settings with private method and returns formated value', async () => {
      expect.assertions(2);

      const res = await connect.getAccountData();

      expect(privateMethods.getUserSettings).toBeCalled();
      expect(res).toEqual({
        activeAccount: '0x0',
        activeNet: 1,
      });
    });
  });

  describe('setProviderSettings', () => {
    let emitter;

    beforeEach(() => {
      emitter = {
        emit: jest.fn(),
      };
      context.emitter = emitter;
    });

    it('should emit settings by inner connect emitter', () => {
      const payload = {
        foo: 'bar',
      };

      connect.setProviderSettings(payload);

      expect(context.emitter.emit).toBeCalledWith(
        INPAGE_EVENTS.SETTINGS,
        payload,
      );
    });
  });

  describe('auth', () => {
    let dialog;

    beforeEach(() => {
      dialog = {
        ask: jest.fn(),
        close: jest.fn(),
      };
      context.dialog = dialog;
      privateMethods.openApp = jest.fn();
    });

    it('should auth user through dialog request and returns result', async () => {
      expect.assertions(4);

      dialog.ask.mockResolvedValueOnce({
        status: true,
      });

      const res = await connect.auth();

      expect(privateMethods.openApp).toBeCalledWith('auth');
      expect(dialog.ask).toBeCalledWith({
        method: METHODS.AUTH,
        redirectUrl: null,
      });
      expect(dialog.close).toBeCalled();
      expect(res).toBe(true);
    });

    it('should throw error if auth status is falsy', () => {
      dialog.ask.mockResolvedValueOnce({
        status: false,
      });

      expect(connect.auth()).rejects.toThrow();
    });
  });

  describe('openAccount', () => {
    let dialog;

    beforeEach(() => {
      dialog = {
        ask: jest.fn(),
        close: jest.fn(),
      };
      context.dialog = dialog;
      privateMethods.openApp = jest.fn();
      connect.setProviderSettings = jest.fn();
    });

    it('should open connect application and awaits any signals from it', async () => {
      expect.assertions(4);

      dialog.ask.mockResolvedValueOnce({
        type: 'foo',
        status: true,
      });

      const res = await connect.openAccount();

      expect(context.dialog.ask).toBeCalledWith({
        method: METHODS.ACCOUNT,
      });
      expect(context.dialog.close).toBeCalled();
      expect(res).toEqual({
        type: 'foo',
      });
    });

    it('should open connect application and returns payload if response type is "update"', async () => {
      expect.assertions(1);

      const payload = {
        foo: 'bar',
      };

      dialog.ask.mockResolvedValueOnce({
        type: 'update',
        status: true,
        payload,
      });

      const res = await connect.openAccount();

      expect(res).toEqual({
        type: 'update',
        payload,
      });
    });

    it('should throw error if request status is falsy', () => {
      dialog.ask.mockResolvedValueOnce({
        status: false,
      });

      expect(connect.openAccount()).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should do something', () => {
      expect(1 + 1).toBe(2);
    });
  });
});

import Connect, { privateMethods } from '@/lib';
import Bridge from '@/class/Bridge';
import Dialog from '@/class/Dialog';
import { INPAGE_EVENTS, METHODS } from '@/constants';

describe('Connect class – public methods', () => {
  let connect;

  beforeAll(() => {
    window.open = jest.fn();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    connect = new Connect({ appUrl: 'http://localhost:5000' });
  });

  describe('createProvider', () => {
    const web3 = {
      foo: 'bar',
    };

    beforeEach(() => {
      window.web3 = undefined;
      connect[privateMethods.createRequestProvider] = jest.fn();
    });

    it('should create provider with web3 from given parameters', () => {
      connect.createProvider(web3);

      expect(connect[privateMethods.createRequestProvider]).toBeCalledWith(
        web3,
      );
    });

    it('should create provider with web3 from window object', () => {
      window.web3 = web3;

      connect.createProvider();

      expect(connect[privateMethods.createRequestProvider]).toBeCalledWith(
        web3,
      );
    });

    it('should throw error if web3 is not passed as parameter and it is not exist in window', () => {
      expect(() => {
        connect.createProvider();
      }).toThrow();
    });
  });

  describe('getAccountData', () => {
    beforeEach(() => {
      connect[privateMethods.getUserSettings] = jest
        .fn()
        .mockResolvedValueOnce({
          lastActiveAccount: '0x0',
          net: 1,
          foo: 'bar',
          bar: 'baz',
        });
    });

    it('should request user settings with private method and returns formated value', async () => {
      expect.assertions(2);

      const res = await connect.getAccountData();

      expect(connect[privateMethods.getUserSettings]).toBeCalled();
      expect(res).toEqual({
        activeAccount: '0x0',
        activeNet: 1,
      });
    });
  });

  describe('setProviderSettings', () => {
    let emmiter;

    beforeEach(() => {
      emmiter = {
        emit: jest.fn(),
      };
      connect.emmiter = emmiter;
    });

    it('should emit settings by inner connect emmiter', () => {
      const payload = {
        foo: 'bar',
      };

      connect.setProviderSettings(payload);

      expect(connect.emmiter.emit).toBeCalledWith(
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
      connect.dialog = dialog;
      connect[privateMethods.openApp] = jest.fn();
    });

    it('should auth user through dialog request and returns result', async () => {
      expect.assertions(4);

      dialog.ask.mockResolvedValueOnce({
        status: true,
      });

      const res = await connect.auth();

      expect(connect[privateMethods.openApp]).toBeCalledWith('auth');
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
      connect.dialog = dialog;
      connect[privateMethods.openApp] = jest.fn();
      connect.setProviderSettings = jest.fn();
    });

    it('should open connect application and awaits any signals from it', async () => {
      expect.assertions(4);

      dialog.ask.mockResolvedValueOnce({
        type: 'foo',
        status: true,
      });

      const res = await connect.openAccount();

      expect(connect.dialog.ask).toBeCalledWith({
        method: METHODS.ACCOUNT,
      });
      expect(connect.dialog.close).toBeCalled();
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

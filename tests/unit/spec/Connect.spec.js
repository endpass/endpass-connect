import Connect from '@/Connect';
import Queue from '@/Queue';
import privateFields from '@/privateFields';
import { InpageProvider, ProviderFactory } from '@/class';
import { INPAGE_EVENTS, METHODS } from '@/constants';

describe('Connect class', () => {
  let connect;
  let context;
  const authUrl = 'http://test.auth';

  beforeAll(() => {
    window.open = jest.fn();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    connect = new Connect({ authUrl });
    context = connect[privateFields.context];
  });

  describe('initial', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create instance of connect if all authUrl present', () => {
      connect = new Connect({ authUrl });
      expect(connect).toBeInstanceOf(Connect);
    });

    it('should subscribe on events is subscribe property passed to constructor', () => {
      jest.spyOn(Queue.prototype, 'setupEventEmitter');
      jest.spyOn(ProviderFactory, 'createRequestProvider');

      connect = new Connect({ authUrl });

      const queue = connect[privateFields.queue];
      context = connect[privateFields.context];

      expect(queue.setupEventEmitter).toBeCalled();
      expect(ProviderFactory.createRequestProvider).toBeCalled();
    });

    it('should be created without authUrl parameter', () => {
      connect = new Connect();
      context = connect[privateFields.context];
      expect(context.authUrl).toBe('https://auth.endpass.com');
    });

    it('should return Inpage provider from given parameters', () => {
      connect = new Connect({ authUrl });
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

  describe('getProvider', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      connect = new Connect({ authUrl });
    });

    it('should return Inpage provider from given parameters', () => {
      const res = connect.getProvider();

      expect(res instanceof InpageProvider).toBe(true);
    });
  });

  describe('getAccountData', () => {
    beforeEach(() => {
      context.bridge.ask = jest.fn().mockResolvedValueOnce({
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
      context.getBridge().ask = jest.fn().mockResolvedValueOnce(response);

      const res = await connect.getAccountData();

      expect(context.getBridge().ask).toBeCalledWith(METHODS.GET_SETTINGS);

      expect(res).toEqual({
        activeAccount: settings.lastActiveAccount,
        activeNet: settings.net,
      });
    });

    it('should throw error is request account status is falsy', async () => {
      expect.assertions(1);

      context.getBridge().ask = jest.fn().mockResolvedValueOnce({
        status: false,
      });

      const err = new Error('User not authorized!');
      let check;
      try {
        await connect.getAccountData();
      } catch (e) {
        check = e;
      }

      expect(check).toEqual(err);
    });
  });

  describe('openAccount', () => {
    let bridge;

    beforeEach(() => {
      bridge = {
        ask: jest.fn(),
      };
      context.bridge = bridge;
      connect.setProviderSettings = jest.fn();
    });

    it('should open connect application and awaits any signals from it', async () => {
      expect.assertions(2);

      bridge.ask.mockResolvedValueOnce({
        status: true,
        payload: {
          type: 'foo',
        },
      });

      const res = await connect.openAccount();

      expect(context.bridge.ask).toBeCalledWith(METHODS.ACCOUNT, undefined);
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

      bridge.ask.mockResolvedValueOnce({
        status: true,
        payload,
      });

      const res = await connect.openAccount();

      expect(res).toEqual({
        type: 'update',
        settings: 'settings',
      });
    });

    it('should throw error if request status is falsy', () => {
      bridge.ask.mockResolvedValueOnce({
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

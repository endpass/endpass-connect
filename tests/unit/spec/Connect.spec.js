import Connect from '@/Connect';
import Context from '@/Context';
import Providers from '@/Providers';
import Queue from '@/Queue';
import privateFields from '@/privateFields';
import { InpageProvider } from '@/class';
import { INPAGE_EVENTS, METHODS, DEFAULT_AUTH_URL } from '@/constants';

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
      jest.spyOn(Context.prototype, 'initBridge');
      jest.spyOn(Providers, 'createRequestProvider');

      connect = new Connect({ authUrl });

      const queue = connect[privateFields.queue];
      context = connect[privateFields.context];

      expect(queue.setupEventEmitter).toBeCalled();
      expect(context.initBridge).toBeCalled();
      expect(Providers.createRequestProvider).toBeCalled();
    });

    it('should be created without authUrl parameter', () => {
      connect = new Connect();
      context = connect[privateFields.context];
      expect(context.authUrl).toBe(DEFAULT_AUTH_URL);
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
        lastActiveAccount: '0x0',
        net: 1,
        foo: 'bar',
        bar: 'baz',
        status: 'ok',
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

      const response = {
        lastActiveAccount: 'lastActiveAccount',
        net: 'net',
        status: true,
      };
      context.getBridge().ask = jest.fn().mockResolvedValueOnce(response);

      const res = await connect.getAccountData();

      expect(context.getBridge().ask).toBeCalledWith({
        method: METHODS.GET_SETTINGS,
      });

      expect(res).toEqual({
        activeAccount: response.lastActiveAccount,
        activeNet: response.net,
      });
    });

    it('should throw error is request status is falsy', async () => {
      expect.assertions(1);

      context.getBridge().ask = jest.fn().mockResolvedValueOnce({
        status: false,
      });

      const err = new Error('User not autorized!');
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
    let dialog;

    beforeEach(() => {
      dialog = {
        ask: jest.fn(),
        close: jest.fn(),
      };
      context.dialog = dialog;
      context.openApp = jest.fn();
      connect.setProviderSettings = jest.fn();
    });

    it('should open connect application and awaits any signals from it', async () => {
      expect.assertions(3);

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

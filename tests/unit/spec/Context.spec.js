import Connect from '@/Connect';
import Bridge from '@/class/Bridge';
import Dialog from '@/class/Dialog';
import privateFields from '@/privateFields';
import { METHODS } from '../../../src/constants';

describe('Context class', () => {
  let connect;
  let context;

  beforeAll(() => {
    window.open = jest.fn();
    jest.useFakeTimers();
    connect = new Connect({ appUrl: 'http://localhost:5000' });
    context = connect[privateFields.context];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConnectUrl', () => {
    it('should return url to auth on connect application', () => {
      expect(context.getConnectUrl('foo')).toBe('https://auth.endpass.com/foo');
    });
  });

  describe('initBridge', () => {
    it('should create new bridge and save link to it in connect instance', () => {
      jest.spyOn(Bridge.prototype, 'mount');

      context.bridge = null;
      context.initBridge();

      expect(context.bridge).not.toBe(null);
      expect(context.bridge.mount).toBeCalled();
    });
  });

  describe('openApp', () => {
    beforeEach(() => {
      Dialog.prototype.open = jest.fn().mockResolvedValueOnce();
    });

    it('should open modal', async () => {
      expect.assertions(1);

      await context.openApp('auth');

      expect(context.dialog.open).toBeCalled();
    });
  });

  describe('auth', () => {
    let dialog;

    beforeEach(() => {
      connect = new Connect({ authUrl: 'http://localhost:5000' });
      dialog = {
        ask: jest.fn(),
        close: jest.fn(),
      };
      context = connect[privateFields.context];
      context.dialog = dialog;
      context.openApp = jest.fn();
    });

    it('should auth user through dialog request and returns result', async () => {
      expect.assertions(4);

      const dialogResponse = {
        status: true,
        payload: {
          type: 'local',
          serverUrl: undefined,
          status: false,
        },
      };

      const authResponse = {
        status: true,
        type: 'local',
        serverUrl: undefined,
      };

      dialog.ask.mockResolvedValueOnce(dialogResponse);

      const res = await context.auth();

      expect(context.openApp).toBeCalledWith('auth');
      expect(dialog.ask).toBeCalledWith({
        method: METHODS.AUTH,
        redirectUrl: null,
      });
      expect(dialog.close).toBeCalled();
      expect(res).toEqual(authResponse);
    });

    it('should throw error if auth status is falsy', () => {
      dialog.ask.mockResolvedValueOnce({
        status: false,
      });

      expect(context.auth()).rejects.toThrow();
    });
  });
});

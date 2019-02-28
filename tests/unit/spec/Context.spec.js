import Connect from '@/Connect';
import Context from '@/Context';
import Bridge from '@/class/Bridge';
import Dialog from '@/class/Dialog';
import privateFields from '@/privateFields';
import { METHODS } from '@/constants';

jest.mock('@/class/Dialog');

describe('Context class', () => {
  let connect;
  let context;
  const authUrl = 'http://test.auth';

  beforeAll(() => {
    window.open = jest.fn();
    jest.useFakeTimers();
    connect = new Connect({ authUrl });
    context = connect[privateFields.context];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConnectUrl', () => {
    it('should return url to auth on connect application', () => {
      expect(context.getConnectUrl('foo')).toBe(`${authUrl}/foo`);
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
    it('should open modal', async () => {
      expect.assertions(2);

      await context.openApp('auth');

      expect(context.dialog.open).toBeCalled();
      expect(Dialog).toBeCalledWith({
        url: `${authUrl}/auth`,
      });
    });
  });

  describe('auth', () => {
    let dialog;

    beforeEach(() => {
      connect = new Connect({ authUrl });
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

      expect(context.openApp).toBeCalledWith('auth', {});
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

  describe('demoData', () => {

    const demoContext = new Context({
      authUrl,
      demoData: {
        v3KeyStore: {
          address: '0xaddr',
        },
        activeNet: 3,
        password: 12345678,
      },
    });

    const withoutDemoContext = new Context({
      authUrl,
    });

    const demoQueryUrl =
      'demoData=%7B%22v3KeyStore%22%3A%7B%22address%22%3A%220xaddr%22%7D%2C%22activeNet%22%3A3%2C%22password%22%3A12345678%7D';

    it('should pass isLogin', () => {
      expect(demoContext.isLogin()).toBe(true);
      expect(withoutDemoContext.isLogin()).toBe(false);
    });

    it('should return url with demoData', async () => {
      expect.assertions(1);

      await demoContext.openApp();

      expect(Dialog).toHaveBeenCalledWith({
        url: `${authUrl}/?${demoQueryUrl}`,
      });
    });

    it('should return url with demoData and route', async () => {
      expect.assertions(1);

      await demoContext.openApp('auth', { check: 'check' });

      expect(Dialog).toHaveBeenCalledWith({
        url: `${authUrl}/auth?check=check&${demoQueryUrl}`,
      });
    });

    it('should return url without demoData', async () => {
      expect.assertions(1);

      await withoutDemoContext.openApp();

      expect(Dialog).toHaveBeenCalledWith({
        url: authUrl,
      });
    });
  });
});

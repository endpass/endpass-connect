import Connect from '@/Connect';
import Context from '@/Context';
import privateFields from '@/privateFields';
import { METHODS, DIRECTION } from '@/constants';
import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';

describe('Context class', () => {
  const authUrl = 'http://test.auth';
  let connect;
  let context;

  beforeAll(() => {
    window.open = jest.fn();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    connect = new Connect({ authUrl });
    context = connect[privateFields.context];
  });

  describe('getConnectUrl', () => {
    it('should return url to auth on connect application', () => {
      expect(context.getConnectUrl('foo')).toBe(`${authUrl}/foo`);
    });
  });

  describe('auth', () => {
    let bridge;

    beforeEach(() => {
      connect = new Connect({ authUrl });
      bridge = {
        ask: jest.fn(),
        openDialog: jest.fn(),
        closeDialog: jest.fn(),
      };
      context = connect[privateFields.context];
      context.bridge = bridge;
    });

    it('should auth user through dialog request and returns result', async () => {
      expect.assertions(2);

      const dialogResponse = {
        status: true,
        payload: {
          type: 'local',
          serverUrl: undefined,
        },
      };

      bridge.ask.mockResolvedValueOnce(dialogResponse);

      const res = await context.auth();

      expect(bridge.ask).toBeCalledWith(METHODS.AUTH, {
        redirectUrl: 'http://localhost/',
      });
      expect(res).toEqual(dialogResponse);
    });

    it('should throw error if auth status is falsy', () => {
      bridge.ask.mockResolvedValueOnce({
        status: false,
      });

      expect(context.auth()).rejects.toThrow();
    });
  });

  describe('initial data', () => {
    const demoData = {
      v3KeyStore: {
        address: '0xaddr',
      },
      activeNet: 3,
      password: 12345678,
    };

    const defaultContext = new Context({
      authUrl,
    });

    it('should pass isLogin with demoData', () => {
      const demoContext = new Context({
        authUrl,
        demoData,
      });

      expect(demoContext.isLogin()).toBe(true);
      expect(defaultContext.isLogin()).toBe(false);
    });

    it('should pass initial data', () => {
      const req = {
        answer: jest.fn(),
      };

      jest
        .spyOn(CrossWindowMessenger.prototype, 'subscribe')
        .mockImplementation((method, cb) => {
          if (method === METHODS.INITIATE) {
            cb({}, req);
          }
        });

      const demoContext = new Context({
        authUrl,
        demoData,
      });

      expect(req.answer).toBeCalledWith({
        demoData,
        isIdentityMode: false,
        source: DIRECTION.WIDGET,
      });

      const otherContex = new Context({
        authUrl,
        isIdentityMode: true,
      });

      expect(req.answer).toBeCalledWith({
        isIdentityMode: true,
        source: DIRECTION.AUTH,
      });
    });
  });

  describe('mountWidget', () => {
    beforeEach(() => {
      context.bridge.mountWidget = jest.fn();
    });

    it('should mount widget', () => {
      context.mountWidget();

      expect(context.isWidgetMounted).toBe(true);
      expect(context.bridge.mountWidget).toBeCalled();
    });

    it('should not do anything if widget is mounted', () => {
      context.isWidgetMounted = true;

      context.mountWidget();

      expect(context.bridge.mountWidget).not.toBeCalled();
    });
  });

  describe('unmountWidget', () => {
    beforeEach(() => {
      context.bridge.unmountWidget = jest.fn();
    });

    it('should unmount widget', () => {
      context.isWidgetMounted = true;

      context.unmountWidget();

      expect(context.isWidgetMounted).toBe(false);
      expect(context.bridge.unmountWidget).toBeCalled();
    });

    it('should not do anything if widget is not mounted', () => {
      context.unmountWidget();

      expect(context.bridge.unmountWidget).not.toBeCalled();
    });
  });
});

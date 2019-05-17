import Connect from '@/Connect';
import Context from '@/Context';
import privateFields from '@/privateFields';
import { METHODS, DIRECTION } from '@/constants';
import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';

describe('Context class', () => {
  const authUrl = 'http://test.auth';
  const oauthClientId = 'xxxxxxxxxx';
  let connect;
  let context;

  beforeAll(() => {
    window.open = jest.fn();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    connect = new Connect({ authUrl, oauthClientId });
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
      connect = new Connect({ authUrl, oauthClientId });
      bridge = {
        ask: jest.fn(),
        openDialog: jest.fn(),
        closeDialog: jest.fn(),
      };
      context = connect[privateFields.context];
      context.bridge = bridge;
    });

    it('throw error without apiKey', () => {
      expect(
        () => new Context({ authUrl, oauthClientId: undefined }),
      ).toThrow();
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

    it('should throw error if auth status is falsy', async () => {
      expect.assertions(1);

      bridge.ask.mockResolvedValueOnce({
        status: false,
      });

      try {
        await context.auth();
      } catch (e) {
        const err = new Error('Authentificaton error!');
        expect(e).toEqual(err);
      }
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

    it('should pass isLogin with demoData', () => {
      const defaultContext = new Context({
        authUrl,
        oauthClientId,
      });

      const demoContext = new Context({
        authUrl,
        oauthClientId,
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
        oauthClientId,
        demoData,
      });

      expect(req.answer).toBeCalledWith({
        demoData,
        isIdentityMode: false,
        source: DIRECTION.AUTH,
      });

      const otherContex = new Context({
        authUrl,
        oauthClientId,
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
      context.bridge.getWidgetNode = jest.fn();
      context.bridge.isWidgetMounted = jest.fn(false);
    });

    it('should mount widget', async () => {
      expect.assertions(1);

      await context.mountWidget();

      expect(context.bridge.mountWidget).toBeCalled();
    });

    it('should not do anything if widget is mounted', async () => {
      expect.assertions(2);

      context.bridge.isWidgetMounted.mockResolvedValueOnce(true);

      await context.mountWidget();

      expect(context.bridge.getWidgetNode).toBeCalledTimes(1);
      expect(context.bridge.mountWidget).not.toBeCalled();
    });

    it('should assign widget messenger on mount and push it to the broadcaster', async () => {
      expect.assertions(3);

      context.messengerGroup.addMessenger = jest.fn();

      expect(context.widgetMessenger).toBeNull();

      await context.mountWidget();

      expect(context.messengerGroup.addMessenger).toBeCalledTimes(1);
      expect(context.widgetMessenger).not.toBeNull();
    });
  });

  describe('unmountWidget', () => {
    it('should unmount widget', async () => {
      expect.assertions(2);

      await context.mountWidget();

      expect(context.bridge.isWidgetMounted()).toBe(true);

      context.unmountWidget();

      expect(context.bridge.isWidgetMounted()).toBe(false);
    });
  });

  describe('initial payload', () => {
    it('should pass initial payload', () => {
      const passPayload = {
        isIdentityMode: true,
        demoData: 'demo',
        showCreateAccount: true,
      };

      const checkContext = new Context({
        authUrl,
        oauthClientId,
        ...passPayload,
      });

      expect(checkContext.bridge.initialPayload).toEqual(passPayload);
    });
  });
});

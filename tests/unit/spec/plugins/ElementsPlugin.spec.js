import { getAuthUrl, getFrameRouteUrl } from '@/util/url';

// import ElementsPlugin from '@/class/components/ElementsPlugin';
const ElementsPlugin = () => {};

describe.skip('Elements plugin', () => {
  // TODO: move some tests to widget/context/dialog
  const authUrl = 'http://test.auth';
  const oauthClientId = 'xxxxxxxxxx';
  const options = { authUrl };

  const dialog = {
    ask: jest.fn(),
    getDialogMessenger() {
      return {
        subscribe: jest.fn(),
      };
    },
  };
  const widget = {
    mount: jest.fn(),
    unmount: jest.fn(),
    getWidgetMessenger() {
      return {
        subscribe: jest.fn(),
      };
    },
  };
  const context = {
    isLogin: true,
    getDialog() {
      return dialog;
    },
    getWidget() {
      return widget;
    },
  };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('auth url correct creation', () => {
    it('should return url to auth on connect application', () => {
      const url = getAuthUrl(authUrl);
      expect(getFrameRouteUrl(url, 'foo')).toBe(`${authUrl}/foo`);

      const plugin = new ElementsPlugin({ context, options });
      expect(plugin.authUrl).toBe(`${authUrl}`);
    });
    it('should return default authUrl', () => {
      const plugin = new ElementsPlugin({ context });
      expect(plugin.authUrl).toBe('https://auth.endpass.com');
    });
  });

  describe('initial payload', () => {
    it('should pass initial payload', () => {
      const passPayload = {
        isIdentityMode: true,
        demoData: 'demo',
        showCreateAccount: true,
      };

      const plugin = new ElementsPlugin({
        context,
        options: {
          authUrl,
          oauthClientId,
          ...passPayload,
        },
      });

      expect(plugin.initialPayload).toEqual(passPayload);
    });
  });

  describe('widget mount', () => {
    it('should automatically mount widget by default', () => {
      context.isLogin = false;
      const plugin = new ElementsPlugin({
        context,
        options,
      });
      plugin.init();

      expect(plugin.widget).toBe(undefined);
      plugin.widget = {
        mount: jest.fn(),
      };

      context.isLogin = true;
      jest.runOnlyPendingTimers();

      expect(plugin.widget.mount).toBeCalledWith(undefined);
    });

    it('should not mount widget', () => {
      context.isLogin = false;
      const plugin = new ElementsPlugin({
        context,
        options: {
          ...options,
          widget: false,
        },
      });
      plugin.init();

      expect(plugin.widget).toBe(undefined);
      plugin.widget = {
        mount: jest.fn(),
      };

      context.isLogin = true;
      jest.runOnlyPendingTimers();

      expect(plugin.widget.mount).not.toBeCalled();
    });
  });
});

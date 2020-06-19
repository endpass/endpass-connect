import { MESSENGER_METHODS, DEFAULT_AUTH_URL } from '@/constants';
import { BridgePlugin } from '@/plugins/BridgePlugin';
import StateOpen from '@/plugins/BridgePlugin/states/StateOpen';
import StateClose from '@/plugins/BridgePlugin/states/StateClose';
import { getAuthUrl, getFrameRouteUrl } from '@/util/url';

describe('BridgePlugin class', () => {
  const authUrl = 'url';
  const context = {
    handleEvent: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open/close dialog', () => {
    const inst = new BridgePlugin({ authUrl }, context);
    inst.mount();

    expect(inst.state).toBeInstanceOf(StateClose);

    inst.handleEvent(null, {
      method: MESSENGER_METHODS.DIALOG_OPEN,
    });

    expect(inst.state).toBeInstanceOf(StateOpen);

    inst.handleEvent(null, {
      method: MESSENGER_METHODS.DIALOG_CLOSE,
    });

    expect(inst.state).toBeInstanceOf(StateClose);
  });

  describe('auth url correct creation', () => {
    it('should correct generate open url', () => {
      const url = getAuthUrl(authUrl);

      expect(getFrameRouteUrl(url, 'foo')).toBe(
        `${authUrl}/prepare.html?redirect=/foo`,
      );
    });

    it('should return url to auth on connect application', () => {
      const plugin = new BridgePlugin({ authUrl }, context);

      expect(plugin.url).toBe(`${authUrl}/prepare.html?redirect=/bridge`);
    });

    it('should return default authUrl', () => {
      const plugin = new BridgePlugin({}, context);

      expect(plugin.url).toBe(`${DEFAULT_AUTH_URL}/prepare.html?redirect=/bridge`);
    });
  });
});
